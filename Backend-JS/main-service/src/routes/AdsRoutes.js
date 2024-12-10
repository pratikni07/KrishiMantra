const express = require('express');
const router = express.Router();
const multer = require('multer');

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'path/to/store/temp/files'); // Specify the temp directory for storing files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Generate unique filenames
    }
});

const upload = multer({ storage: storage });

const HomeAdsController = require('../controller/Advertisement/HomeAdsController');
const FeedAdsController = require('../controller/Advertisement/FeedAdsController');
const NewsAdsController = require('../controller/Advertisement/NewsAdsController');
const DisplayController = require('../controller/Advertisement/DisplayController');


// Home Slider Ads Routes
router.post('/home-ads',upload.single('image'), HomeAdsController.createHomeAd);
router.get('/home-ads', HomeAdsController.getHomeAds);
router.put('/home-ads/:id', upload.single('image'), HomeAdsController.updateHomeAd);
router.delete('/home-ads/:id', HomeAdsController.deleteHomeAd);

// Home Screen Ads Routes
router.post('/home-screen-ads', upload.single('image'), HomeAdsController.createHomeScreen);
router.get('/home-screen-ads', HomeAdsController.getAllHomeScreen);
router.get('/home-screen-ads/:id', HomeAdsController.getHomeScreenById);
router.put('/home-screen-ads/:id', upload.single('image'), HomeAdsController.updateHomeScreen);
router.delete('/home-screen-ads/:id', HomeAdsController.deleteHomeScreen);

// Home Screen Splash Modal Routes
router.post('/splash-modal', upload.single('image'), HomeAdsController.createSplash);
router.get('/splash-modal', HomeAdsController.getAllSplash);
router.get('/splash-modal/:id', HomeAdsController.getSplashById);
router.put('/splash-modal/:id', upload.single('image'), HomeAdsController.updateSplash);
router.delete('/splash-modal/:id', HomeAdsController.deleteSplash);

// Feed Ads Routes
router.post('/feed-ads', upload.single('image'), FeedAdsController.createFeedAd);
router.get('/feed-ads', FeedAdsController.getFeedAds);
router.put('/feed-ads/:id', upload.single('image'), FeedAdsController.updateFeedAd);
router.delete('/feed-ads/:id', FeedAdsController.deleteFeedAd);
router.post('/feed-ads/:id/impression', FeedAdsController.trackImpression);

// Reel Ads Routes
router.post('/reel-ads', upload.single('image'), FeedAdsController.createReelAd);
router.get('/reel-ads', FeedAdsController.getReelAds);
router.put('/reel-ads/:id', upload.single('image'), FeedAdsController.updateReelAd);
router.delete('/reel-ads/:id', FeedAdsController.deleteReelAd);
router.post('/reel-ads/:id/impression', FeedAdsController.trackImpression);
router.post('/reel-ads/:id/view', FeedAdsController.trackView);

// News Ads Routes
router.post('/news-ads', upload.single('image'), NewsAdsController.createNewsAd);
router.get('/news-ads', NewsAdsController.getNewsAds);
router.put('/news-ads/:id', upload.single('image'), NewsAdsController.updateNewsAd);
router.delete('/news-ads/:id', NewsAdsController.deleteNewsAd);
router.post('/news-ads/:id/impression', NewsAdsController.trackImpression);

// Dynamic Display Routes
router.get('/display', DisplayController.getDynamicDisplay);
router.put('/display-settings', DisplayController.updateDisplaySettings);

module.exports = router;