// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./PresTiqxNFT.sol";

/**
 * @title PresTiqxMarketplace
 * @dev Secondary marketplace for PresTiqx NFT tickets
 */
contract PresTiqxMarketplace is ReentrancyGuard, Ownable, IERC721Receiver {
    PresTiqxNFT public royalTixContract;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        uint256 listedAt;
    }

    struct Offer {
        uint256 tokenId;
        address buyer;
        uint256 amount;
        uint256 expiresAt;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    mapping(uint256 => uint256) public offerCount;

    uint256 public marketplaceFeeRate = 250; // 2.5%
    address public feeRecipient;

    uint256[] public activeListings;
    mapping(uint256 => uint256) public listingIndex;

    event TokenListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event TokenSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event OfferMade(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 amount,
        uint256 expiresAt
    );
    event OfferAccepted(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 amount
    );
    event OfferCancelled(uint256 indexed tokenId, address indexed buyer);

    constructor(address _royalTixContract, address _feeRecipient) {
        royalTixContract = PresTiqxNFT(_royalTixContract);
        feeRecipient = _feeRecipient;
    }

    modifier onlyTokenOwner(uint256 tokenId) {
        require(
            royalTixContract.ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );
        _;
    }

    modifier validListing(uint256 tokenId) {
        require(listings[tokenId].active, "Listing not active");
        _;
    }

    /**
     * @dev List a token for sale
     */
    function listToken(
        uint256 tokenId,
        uint256 price
    ) external onlyTokenOwner(tokenId) {
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].active, "Token already listed");
        require(
            royalTixContract.getApproved(tokenId) == address(this) ||
                royalTixContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        // Check if ticket is not used and event hasn't ended
        (, uint256 eventId, , , , , bool used, ) = royalTixContract.getTicket(
            tokenId
        );
        (
            ,
            ,
            ,
            ,
            ,
            uint256 eventDate,
            ,
            ,
            PresTiqxNFT.EventStatus status,
            ,
            ,

        ) = royalTixContract.getEvent(eventId);

        require(!used, "Cannot list used ticket");
        require(
            status == PresTiqxNFT.EventStatus.Published,
            "Event not active"
        );
        require(eventDate > block.timestamp, "Event has already occurred");

        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            listedAt: block.timestamp
        });

        activeListings.push(tokenId);
        listingIndex[tokenId] = activeListings.length - 1;

        emit TokenListed(tokenId, msg.sender, price);
    }

    /**
     * @dev Buy a listed token
     */
    function buyToken(
        uint256 tokenId
    ) external payable validListing(tokenId) nonReentrant {
        Listing storage listing = listings[tokenId];
        require(msg.value >= listing.price, "Insufficient payment");
        require(listing.seller != msg.sender, "Cannot buy your own token");

        address seller = listing.seller;
        uint256 price = listing.price;

        // Remove listing
        _removeListing(tokenId);

        // Calculate fees
        uint256 marketplaceFee = (price * marketplaceFeeRate) / 10000;
        uint256 sellerAmount = price - marketplaceFee;

        // Transfer token
        royalTixContract.safeTransferFrom(seller, msg.sender, tokenId);

        // Transfer payments
        if (marketplaceFee > 0) {
            payable(feeRecipient).transfer(marketplaceFee);
        }
        payable(seller).transfer(sellerAmount);

        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit TokenSold(tokenId, seller, msg.sender, price);
    }

    /**
     * @dev Cancel a listing
     */
    function cancelListing(
        uint256 tokenId
    ) external onlyTokenOwner(tokenId) validListing(tokenId) {
        _removeListing(tokenId);
        emit ListingCancelled(tokenId, msg.sender);
    }

    /**
     * @dev Make an offer on a token
     */
    function makeOffer(uint256 tokenId, uint256 expiresAt) external payable {
        require(msg.value > 0, "Offer must be greater than 0");
        require(
            expiresAt > block.timestamp,
            "Expiration must be in the future"
        );
        require(
            royalTixContract.ownerOf(tokenId) != msg.sender,
            "Cannot offer on your own token"
        );

        // Check if ticket is valid for offers
        (, uint256 eventId, , , , , bool used, ) = royalTixContract.getTicket(
            tokenId
        );
        (
            ,
            ,
            ,
            ,
            ,
            uint256 eventDate,
            ,
            ,
            PresTiqxNFT.EventStatus status,
            ,
            ,

        ) = royalTixContract.getEvent(eventId);

        require(!used, "Cannot offer on used ticket");
        require(
            status == PresTiqxNFT.EventStatus.Published,
            "Event not active"
        );
        require(eventDate > block.timestamp, "Event has already occurred");

        offers[tokenId].push(
            Offer({
                tokenId: tokenId,
                buyer: msg.sender,
                amount: msg.value,
                expiresAt: expiresAt,
                active: true
            })
        );

        offerCount[tokenId]++;

        emit OfferMade(tokenId, msg.sender, msg.value, expiresAt);
    }

    /**
     * @dev Accept an offer
     */
    function acceptOffer(
        uint256 tokenId,
        uint256 offerIndex
    ) external onlyTokenOwner(tokenId) nonReentrant {
        require(offerIndex < offers[tokenId].length, "Invalid offer index");

        Offer storage offer = offers[tokenId][offerIndex];
        require(offer.active, "Offer not active");
        require(offer.expiresAt > block.timestamp, "Offer expired");
        require(
            royalTixContract.getApproved(tokenId) == address(this) ||
                royalTixContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        address buyer = offer.buyer;
        uint256 amount = offer.amount;

        // Deactivate offer
        offer.active = false;

        // Remove any active listing
        if (listings[tokenId].active) {
            _removeListing(tokenId);
        }

        // Calculate fees
        uint256 marketplaceFee = (amount * marketplaceFeeRate) / 10000;
        uint256 sellerAmount = amount - marketplaceFee;

        // Transfer token
        royalTixContract.safeTransferFrom(msg.sender, buyer, tokenId);

        // Transfer payments
        if (marketplaceFee > 0) {
            payable(feeRecipient).transfer(marketplaceFee);
        }
        payable(msg.sender).transfer(sellerAmount);

        emit OfferAccepted(tokenId, msg.sender, buyer, amount);
    }

    /**
     * @dev Cancel an offer and refund
     */
    function cancelOffer(
        uint256 tokenId,
        uint256 offerIndex
    ) external nonReentrant {
        require(offerIndex < offers[tokenId].length, "Invalid offer index");

        Offer storage offer = offers[tokenId][offerIndex];
        require(offer.buyer == msg.sender, "Not your offer");
        require(offer.active, "Offer not active");

        uint256 refundAmount = offer.amount;
        offer.active = false;

        payable(msg.sender).transfer(refundAmount);

        emit OfferCancelled(tokenId, msg.sender);
    }

    /**
     * @dev Get active listings
     */
    function getActiveListings() external view returns (uint256[] memory) {
        return activeListings;
    }

    /**
     * @dev Get offers for a token
     */
    function getOffers(
        uint256 tokenId
    )
        external
        view
        returns (
            address[] memory buyers,
            uint256[] memory amounts,
            uint256[] memory expirations,
            bool[] memory activeStatus
        )
    {
        uint256 length = offers[tokenId].length;
        buyers = new address[](length);
        amounts = new uint256[](length);
        expirations = new uint256[](length);
        activeStatus = new bool[](length);

        for (uint256 i = 0; i < length; i++) {
            Offer storage offer = offers[tokenId][i];
            buyers[i] = offer.buyer;
            amounts[i] = offer.amount;
            expirations[i] = offer.expiresAt;
            activeStatus[i] = offer.active && offer.expiresAt > block.timestamp;
        }
    }

    /**
     * @dev Update marketplace fee rate (only owner)
     */
    function setMarketplaceFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 1000, "Fee rate cannot exceed 10%");
        marketplaceFeeRate = newFeeRate;
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = newFeeRecipient;
    }

    /**
     * @dev Remove a listing from active listings array
     */
    function _removeListing(uint256 tokenId) internal {
        listings[tokenId].active = false;

        uint256 index = listingIndex[tokenId];
        uint256 lastIndex = activeListings.length - 1;

        if (index != lastIndex) {
            uint256 lastTokenId = activeListings[lastIndex];
            activeListings[index] = lastTokenId;
            listingIndex[lastTokenId] = index;
        }

        activeListings.pop();
        delete listingIndex[tokenId];
    }

    /**
     * @dev Handle the receipt of an NFT
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
