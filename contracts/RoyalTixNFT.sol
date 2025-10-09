// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PresTiqxNFT
 * @dev NFT-based ticket system for exclusive events
 */
contract PresTiqxNFT is
    ERC721,
    ERC721URIStorage,
    ERC721Enumerable,
    ReentrancyGuard,
    Ownable
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _eventIdCounter;

    // Ticket rarity levels
    enum TicketRarity {
        Common,
        Rare,
        Legendary
    }

    // Event status
    enum EventStatus {
        Draft,
        Published,
        Ended,
        Cancelled
    }

    // Ticket tier structure
    struct TicketTier {
        string name;
        uint256 price;
        uint256 maxSupply;
        uint256 currentSupply;
        TicketRarity rarity;
        string[] features;
        bool active;
    }

    // Event structure
    struct Event {
        uint256 eventId;
        address organizer;
        string title;
        string description;
        string venue;
        uint256 eventDate;
        string imageURI;
        string category;
        EventStatus status;
        uint256 createdAt;
        mapping(uint256 => TicketTier) tiers;
        uint256 tierCount;
        uint256 totalRevenue;
        uint256 totalTicketsSold;
    }

    // Ticket structure
    struct Ticket {
        uint256 tokenId;
        uint256 eventId;
        uint256 tierId;
        address owner;
        uint256 purchasePrice;
        uint256 purchaseDate;
        bool used;
        string metadataURI;
    }

    // Mappings
    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => bool) public authorizedOrganizers;
    mapping(uint256 => mapping(uint256 => uint256[])) public eventTierTickets; // eventId => tierId => tokenIds

    // Platform fee (in basis points, 250 = 2.5%)
    uint256 public platformFeeRate = 250;
    address public feeRecipient;

    // Events
    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        string title
    );
    event EventPublished(uint256 indexed eventId);
    event TicketTierAdded(
        uint256 indexed eventId,
        uint256 indexed tierId,
        string name,
        uint256 price
    );
    event TicketPurchased(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        uint256 indexed tierId,
        address buyer,
        uint256 price
    );
    event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId);
    event OrganizerAuthorized(address indexed organizer);
    event OrganizerRevoked(address indexed organizer);

    constructor(address _feeRecipient) ERC721("PresTiqx", "RTIX") {
        feeRecipient = _feeRecipient;
        _tokenIdCounter.increment(); // Start from token ID 1
        _eventIdCounter.increment(); // Start from event ID 1
    }

    modifier onlyAuthorizedOrganizer() {
        require(
            authorizedOrganizers[msg.sender] || msg.sender == owner(),
            "Not authorized organizer"
        );
        _;
    }

    modifier onlyEventOrganizer(uint256 eventId) {
        require(
            events[eventId].organizer == msg.sender || msg.sender == owner(),
            "Not event organizer"
        );
        _;
    }

    modifier eventExists(uint256 eventId) {
        require(
            eventId > 0 && eventId < _eventIdCounter.current(),
            "Event does not exist"
        );
        _;
    }

    /**
     * @dev Authorize an organizer to create events
     */
    function authorizeOrganizer(address organizer) external onlyOwner {
        authorizedOrganizers[organizer] = true;
        emit OrganizerAuthorized(organizer);
    }

    /**
     * @dev Revoke organizer authorization
     */
    function revokeOrganizer(address organizer) external onlyOwner {
        authorizedOrganizers[organizer] = false;
        emit OrganizerRevoked(organizer);
    }

    /**
     * @dev Create a new event
     */
    function createEvent(
        string memory title,
        string memory description,
        string memory venue,
        uint256 eventDate,
        string memory imageURI,
        string memory category
    ) external onlyAuthorizedOrganizer returns (uint256) {
        require(
            eventDate > block.timestamp,
            "Event date must be in the future"
        );
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(venue).length > 0, "Venue cannot be empty");

        uint256 eventId = _eventIdCounter.current();
        _eventIdCounter.increment();

        Event storage newEvent = events[eventId];
        newEvent.eventId = eventId;
        newEvent.organizer = msg.sender;
        newEvent.title = title;
        newEvent.description = description;
        newEvent.venue = venue;
        newEvent.eventDate = eventDate;
        newEvent.imageURI = imageURI;
        newEvent.category = category;
        newEvent.status = EventStatus.Draft;
        newEvent.createdAt = block.timestamp;
        newEvent.tierCount = 0;
        newEvent.totalRevenue = 0;
        newEvent.totalTicketsSold = 0;

        emit EventCreated(eventId, msg.sender, title);
        return eventId;
    }

    /**
     * @dev Add a ticket tier to an event
     */
    function addTicketTier(
        uint256 eventId,
        string memory name,
        uint256 price,
        uint256 maxSupply,
        TicketRarity rarity,
        string[] memory features
    ) external eventExists(eventId) onlyEventOrganizer(eventId) {
        require(
            events[eventId].status == EventStatus.Draft,
            "Cannot modify published event"
        );
        require(price > 0, "Price must be greater than 0");
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(bytes(name).length > 0, "Tier name cannot be empty");

        uint256 tierId = events[eventId].tierCount;

        TicketTier storage tier = events[eventId].tiers[tierId];
        tier.name = name;
        tier.price = price;
        tier.maxSupply = maxSupply;
        tier.currentSupply = 0;
        tier.rarity = rarity;
        tier.features = features;
        tier.active = true;

        events[eventId].tierCount++;

        emit TicketTierAdded(eventId, tierId, name, price);
    }

    /**
     * @dev Publish an event (make it available for ticket sales)
     */
    function publishEvent(
        uint256 eventId
    ) external eventExists(eventId) onlyEventOrganizer(eventId) {
        require(
            events[eventId].status == EventStatus.Draft,
            "Event already published"
        );
        require(
            events[eventId].tierCount > 0,
            "Event must have at least one ticket tier"
        );

        events[eventId].status = EventStatus.Published;
        emit EventPublished(eventId);
    }

    /**
     * @dev Purchase a ticket for an event
     */
    function purchaseTicket(
        uint256 eventId,
        uint256 tierId,
        string memory metadataURI
    ) external payable eventExists(eventId) nonReentrant {
        Event storage eventData = events[eventId];
        require(
            eventData.status == EventStatus.Published,
            "Event not available for purchase"
        );
        require(
            eventData.eventDate > block.timestamp,
            "Event has already occurred"
        );
        require(tierId < eventData.tierCount, "Invalid tier ID");

        TicketTier storage tier = eventData.tiers[tierId];
        require(tier.active, "Tier not active");
        require(tier.currentSupply < tier.maxSupply, "Tier sold out");
        require(msg.value >= tier.price, "Insufficient payment");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Create ticket
        Ticket storage ticket = tickets[tokenId];
        ticket.tokenId = tokenId;
        ticket.eventId = eventId;
        ticket.tierId = tierId;
        ticket.owner = msg.sender;
        ticket.purchasePrice = tier.price;
        ticket.purchaseDate = block.timestamp;
        ticket.used = false;
        ticket.metadataURI = metadataURI;

        // Update tier and event data
        tier.currentSupply++;
        eventData.totalTicketsSold++;
        eventData.totalRevenue += tier.price;
        eventTierTickets[eventId][tierId].push(tokenId);

        // Mint NFT
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Handle payments
        uint256 platformFee = (tier.price * platformFeeRate) / 10000;
        uint256 organizerPayment = tier.price - platformFee;

        // Transfer platform fee
        if (platformFee > 0) {
            payable(feeRecipient).transfer(platformFee);
        }

        // Transfer payment to organizer
        payable(eventData.organizer).transfer(organizerPayment);

        // Refund excess payment
        if (msg.value > tier.price) {
            payable(msg.sender).transfer(msg.value - tier.price);
        }

        emit TicketPurchased(tokenId, eventId, tierId, msg.sender, tier.price);
    }

    /**
     * @dev Mark a ticket as used (for event entry)
     */
    function useTicket(uint256 tokenId) external {
        require(_exists(tokenId), "Token does not exist");
        Ticket storage ticket = tickets[tokenId];
        require(
            ownerOf(tokenId) == msg.sender ||
                events[ticket.eventId].organizer == msg.sender,
            "Not authorized"
        );
        require(!ticket.used, "Ticket already used");
        require(
            events[ticket.eventId].eventDate <= block.timestamp + 1 hours,
            "Event not started yet"
        );

        ticket.used = true;
        emit TicketUsed(tokenId, ticket.eventId);
    }

    /**
     * @dev Get event details
     */
    function getEvent(
        uint256 eventId
    )
        external
        view
        eventExists(eventId)
        returns (
            uint256,
            address,
            string memory,
            string memory,
            string memory,
            uint256,
            string memory,
            string memory,
            EventStatus,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        Event storage eventData = events[eventId];
        return (
            eventData.eventId,
            eventData.organizer,
            eventData.title,
            eventData.description,
            eventData.venue,
            eventData.eventDate,
            eventData.imageURI,
            eventData.category,
            eventData.status,
            eventData.createdAt,
            eventData.tierCount,
            eventData.totalRevenue,
            eventData.totalTicketsSold
        );
    }

    /**
     * @dev Get ticket tier details
     */
    function getTicketTier(
        uint256 eventId,
        uint256 tierId
    )
        external
        view
        eventExists(eventId)
        returns (
            string memory,
            uint256,
            uint256,
            uint256,
            TicketRarity,
            string[] memory,
            bool
        )
    {
        require(tierId < events[eventId].tierCount, "Invalid tier ID");
        TicketTier storage tier = events[eventId].tiers[tierId];
        return (
            tier.name,
            tier.price,
            tier.maxSupply,
            tier.currentSupply,
            tier.rarity,
            tier.features,
            tier.active
        );
    }

    /**
     * @dev Get ticket details
     */
    function getTicket(
        uint256 tokenId
    )
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            address,
            uint256,
            uint256,
            bool,
            string memory
        )
    {
        require(_exists(tokenId), "Token does not exist");
        Ticket storage ticket = tickets[tokenId];
        return (
            ticket.tokenId,
            ticket.eventId,
            ticket.tierId,
            ticket.owner,
            ticket.purchasePrice,
            ticket.purchaseDate,
            ticket.used,
            ticket.metadataURI
        );
    }

    /**
     * @dev Get tickets owned by an address
     */
    function getTicketsByOwner(
        address owner
    ) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);

        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }

        return tokenIds;
    }

    /**
     * @dev Get events created by an organizer
     */
    function getEventsByOrganizer(
        address organizer
    ) external view returns (uint256[] memory) {
        uint256 totalEvents = _eventIdCounter.current() - 1;
        uint256[] memory tempEventIds = new uint256[](totalEvents);
        uint256 count = 0;

        for (uint256 i = 1; i <= totalEvents; i++) {
            if (events[i].organizer == organizer) {
                tempEventIds[count] = i;
                count++;
            }
        }

        uint256[] memory eventIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            eventIds[i] = tempEventIds[i];
        }

        return eventIds;
    }

    /**
     * @dev Get all published events
     */
    function getPublishedEvents() external view returns (uint256[] memory) {
        uint256 totalEvents = _eventIdCounter.current() - 1;
        uint256[] memory tempEventIds = new uint256[](totalEvents);
        uint256 count = 0;

        for (uint256 i = 1; i <= totalEvents; i++) {
            if (events[i].status == EventStatus.Published) {
                tempEventIds[count] = i;
                count++;
            }
        }

        uint256[] memory eventIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            eventIds[i] = tempEventIds[i];
        }

        return eventIds;
    }

    /**
     * @dev Update platform fee rate (only owner)
     */
    function setPlatformFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = newFeeRate;
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = newFeeRecipient;
    }

    /**
     * @dev End an event (only organizer or owner)
     */
    function endEvent(
        uint256 eventId
    ) external eventExists(eventId) onlyEventOrganizer(eventId) {
        require(
            events[eventId].status == EventStatus.Published,
            "Event not published"
        );
        events[eventId].status = EventStatus.Ended;
    }

    /**
     * @dev Cancel an event (only organizer or owner)
     */
    function cancelEvent(
        uint256 eventId
    ) external eventExists(eventId) onlyEventOrganizer(eventId) {
        require(
            events[eventId].status != EventStatus.Ended,
            "Cannot cancel ended event"
        );
        events[eventId].status = EventStatus.Cancelled;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Override required functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
