const HomeSlider = require('../../model/UIModel/HomeScreen/HomeSliderModel');
const cloudinary = require('../../config/cloudinary');
const RedisClient = require('../../config/redis');

class HomeAdsController {

    // HOME SLIDER
    async createHomeAd(req, res) {
      try {
          const { title, content, dirURL, modal, prority } = req.body;
  
          // File upload happens automatically with multer-storage-cloudinary
          const file = req.file;
  
          if (!file) {
              return res.status(400).json({ error: 'File not uploaded or invalid format' });
          }
  
          // Create the Home Ad with the Cloudinary URL
          const newHomeAd = new HomeSlider({
              title,
              content,
              dirURL: dirURL, 
              modal,
              prority,
          });
  
          await newHomeAd.save();
          await RedisClient.del('home_ads'); // Clear cache
  
          res.status(201).json({ message: 'Home Ad created', ad: newHomeAd });
      } catch (error) {
          console.error('Error creating Home Ad:', error);
          res.status(500).json({ error: error.message });
      }
    }
  

    async getHomeAds(req, res) {
        try {
            const cachedAds = await RedisClient.get('home_ads');
            if (cachedAds) return res.json(JSON.parse(cachedAds));

            const homeAds = await HomeSlider.find().sort({ prority: -1 });
            await RedisClient.setex('home_ads', 3600, JSON.stringify(homeAds));

            res.json(homeAds);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateHomeAd(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const file = req.file;

            if (file) {
                const cloudinaryResult = await cloudinary.uploader.upload(file.path);
                updateData.dirURL = cloudinaryResult.secure_url;
            }

            const updatedAd = await HomeSlider.findByIdAndUpdate(id, updateData, { new: true });
            await RedisClient.del('home_ads');

            res.json(updatedAd);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteHomeAd(req, res) {
        try {
            const { id } = req.params;
            await HomeSlider.findByIdAndDelete(id);
            await RedisClient.del('home_ads');

            res.json({ message: 'Home Ad deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // HOME SCREEN ADS 
    async createHomeScreen(req, res) {
        try {
          if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, { 
              folder: 'home-screen-ads' 
            });
            req.body.dirURL = uploadResult.secure_url;
          }
    
          const document = new HomeScreemAds(req.body);
          await document.save();
    
          await redisClient.set(`HomeScreemAds:${document._id}`, JSON.stringify(document));
    
          res.status(201).json(document);
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
    }
    
    async getHomeScreenById (req, res) {
        try {
          const cacheKey = `HomeScreemAds:${req.params.id}`;
          
          const cachedDocument = await redisClient.get(cacheKey);
          if (cachedDocument) {
            return res.json(JSON.parse(cachedDocument));
          }
    
          const document = await HomeScreemAds.findById(req.params.id);
          if (!document) {
            return res.status(404).json({ message: 'Home Screen Ad not found' });
          }
    
          await redisClient.set(cacheKey, JSON.stringify(document));
          
          res.json(document);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
    }
    
    async updateHomeScreen (req, res) {
        try {
          if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, { 
              folder: 'home-screen-ads' 
            });
            req.body.dirURL = uploadResult.secure_url;
          }
    
          const document = await HomeScreemAds.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
          );
    
          if (!document) {
            return res.status(404).json({ message: 'Home Screen Ad not found' });
          }
    
          const cacheKey = `HomeScreemAds:${document._id}`;
          await redisClient.set(cacheKey, JSON.stringify(document));
          
          res.json(document);
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
    }
    
    async deleteHomeScreen (req, res) {
        try {
          const document = await HomeScreemAds.findByIdAndDelete(req.params.id);
          if (!document) {
            return res.status(404).json({ message: 'Home Screen Ad not found' });
          }
    
          const cacheKey = `HomeScreemAds:${req.params.id}`;
          await redisClient.del(cacheKey);
          
          res.json({ message: 'Home Screen Ad deleted successfully' });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }
    
       async getAllHomeScreen (req, res) {
        try {
          const CACHE_KEY = 'HomeScreemAds:All';
          
          const cachedDocuments = await redisClient.get(CACHE_KEY);
          if (cachedDocuments) {
            return res.json(JSON.parse(cachedDocuments));
          }
    
          const documents = await HomeScreemAds.find();
    
          await redisClient.setex(CACHE_KEY, 3600, JSON.stringify(documents));
          
          res.json(documents);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }

    // HOME SCREEN SPLASH MODAL
    // Create Splash Modal with Cloudinary Upload
    async createSplash (req, res)  {
    try {
      let uploadResult;
      if (req.file) {
        uploadResult = await cloudinary.uploader.upload(req.file.path, { 
          folder: 'splash-modals' 
        });
        req.body.dirURL = uploadResult.secure_url;
      }

      const document = new SplashModal(req.body);
      await document.save();

      // Cache in Redis
      await RedisClient.set(`SplashModal:${document._id}`, JSON.stringify(document));

      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
    }

    // Get Splash Modal with Redis Caching
    async getSplashById (req, res)  {
        try {
        const cacheKey = `SplashModal:${req.params.id}`;
        
        // Check Redis cache
        const cachedDocument = await RedisClient.get(cacheKey);
        if (cachedDocument) {
            return res.json(JSON.parse(cachedDocument));
        }

        const document = await SplashModal.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Splash Modal not found' });
        }

        // Cache in Redis
        await RedisClient.set(cacheKey, JSON.stringify(document));
        
        res.json(document);
        } catch (error) {
        res.status(500).json({ message: error.message });
        }
    }

    // Update Splash Modal with Cloudinary
    async updateSplash(req, res)  {
        try {
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, { 
            folder: 'splash-modals' 
            });
            req.body.dirURL = uploadResult.secure_url;
        }

        const document = await SplashModal.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!document) {
            return res.status(404).json({ message: 'Splash Modal not found' });
        }

        // Update Redis cache
        const cacheKey = `SplashModal:${document._id}`;
        await RedisClient.set(cacheKey, JSON.stringify(document));
        
        res.json(document);
        } catch (error) {
        res.status(400).json({ message: error.message });
        }
    }

    // Delete Splash Modal with Cache Invalidation
    async deleteSplash (req, res)  {
        try {
        const document = await SplashModal.findByIdAndDelete(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Splash Modal not found' });
        }

        // Remove from Redis cache
        const cacheKey = `SplashModal:${req.params.id}`;
        await RedisClient.del(cacheKey);
        
        res.json({ message: 'Splash Modal deleted successfully' });
        } catch (error) {
        res.status(500).json({ message: error.message });
        }
    }

    // Get All Splash Modals with Caching
    async getAllSplash(req, res){
        try {
            const CACHE_KEY = 'SplashModal:All';
            
            // Check Redis cache
            const cachedDocuments = await RedisClient.get(CACHE_KEY);
            if (cachedDocuments) {
                return res.json(JSON.parse(cachedDocuments));
            }

            const documents = await SplashModal.find();

            // Cache in Redis
            await RedisClient.setex(CACHE_KEY, 3600, JSON.stringify(documents));
        
            res.json(documents);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = new HomeAdsController();