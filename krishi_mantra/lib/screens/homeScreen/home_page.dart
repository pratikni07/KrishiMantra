import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:krishi_mantra/API/HomeScreenAPI.dart';
import 'package:krishi_mantra/screens/components/PostCard.dart';
import 'package:krishi_mantra/screens/components/TestimonialSection.dart';
import 'package:krishi_mantra/screens/components/NewsCard.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AdCarousel extends StatelessWidget {
  final List<Map<String, dynamic>> ads;

  const AdCarousel({super.key, required this.ads});

  @override
  Widget build(BuildContext context) {
    return ads.isEmpty
        ? const SizedBox.shrink()
        : SizedBox(
            height: 100,
            child: PageView.builder(
              itemCount: ads.length,
              itemBuilder: (context, index) {
                return Container(
                  child: ClipRRect(
                    child: SizedBox(
                      child: Image.network(
                        ads[index]['dirURL'],
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: Colors.grey[300],
                            child: const Icon(Icons.error),
                          );
                        },
                      ),
                    ),
                  ),
                );
              },
            ),
          );
  }
}

class FarmerHomePage extends StatefulWidget {
  const FarmerHomePage({super.key});

  @override
  State<FarmerHomePage> createState() => _FarmerHomePageState();
}

class _FarmerHomePageState extends State<FarmerHomePage> {
  int _currentIndex = 0;
  bool _isLocationSaved = false;
  String _savedLocation = '';
  List<Map<String, dynamic>> priority1Ads = [];
  List<Map<String, dynamic>> priority2Ads = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchAds();
    _checkLocationStatus();
  }

  Future<void> fetchAds() async {
    try {
      final response = await ApiService().getHomeScreenAds();

      if (response.statusCode == 200) {
        final List<dynamic> adsData = json.decode(response.body);

        setState(() {
          priority1Ads = adsData
              .where((ad) => ad['prority'] == 1)
              .map((ad) => Map<String, dynamic>.from(ad))
              .toList();

          priority2Ads = adsData
              .where((ad) => ad['prority'] == 2)
              .map((ad) => Map<String, dynamic>.from(ad))
              .toList();

          print('Priority 1 Ads: $priority1Ads');
          print('Priority 2 Ads: $priority2Ads');

          isLoading = false;
        });
      } else {
        throw Exception('Failed to load ads: ${response.statusCode}');
      }
    } catch (e) {
      print('Error in fetchAds: $e'); // Debug print
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading ads: $e')),
      );
    }
  }

  Future<void> _checkLocationStatus() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isLocationSaved = prefs.containsKey('user_location');
      _savedLocation = prefs.getString('user_location') ?? '';
    });

    if (!_isLocationSaved) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _showLocationAccessModal();
      });
    }
  }

  Future<void> _requestLocation() async {
    var status = await Permission.location.request();

    if (status.isGranted) {
      try {
        Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(
            'user_location', '${position.latitude},${position.longitude}');

        setState(() {
          _isLocationSaved = true;
          _savedLocation = '${position.latitude},${position.longitude}';
        });

        Navigator.of(context).pop();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to retrieve location: $e')),
        );
      }
    } else {
      _showPermissionDeniedDialog();
    }
  }

  void _showPermissionDeniedDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Location Access Denied'),
          content: const Text(
              'Please enable location permissions in your device settings to use this feature.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                openAppSettings();
              },
              child: const Text('Open Settings'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
          ],
        );
      },
    );
  }

  void _showLocationAccessModal() {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      builder: (BuildContext context) {
        return Container(
          padding: const EdgeInsets.all(20),
          height: MediaQuery.of(context).size.height * 0.5,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
            boxShadow: [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 10,
                spreadRadius: 5,
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(Icons.location_on, size: 100, color: Colors.green[700]),
              const SizedBox(height: 20),
              Text(
                'Enable Location Access',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.green[900],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 15),
              Text(
                'We need your location to provide personalized agricultural insights, weather updates, and local crop recommendations.',
                style: TextStyle(fontSize: 16, color: Colors.grey[700]),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red[100],
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                    child: Text(
                      'Not Now',
                      style: TextStyle(
                        color: Colors.red[800],
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 20),
                  ElevatedButton(
                    onPressed: _requestLocation,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                    child: const Text(
                      'Allow Access',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _currentIndex == 0
          ? HomeContent(
              priority1Ads: priority1Ads,
              priority2Ads: priority2Ads,
              isLoading: isLoading,
            )
          : _pages[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.2),
              spreadRadius: 1,
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onTabTapped,
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: const Color(0xFF4CAF50),
          unselectedItemColor: Colors.grey,
          selectedLabelStyle: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
          unselectedLabelStyle: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.grid_view_outlined),
              activeIcon: Icon(Icons.grid_view),
              label: 'Feed',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.volunteer_activism_outlined),
              activeIcon: Icon(Icons.volunteer_activism),
              label: 'Crop Care',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.store_outlined),
              activeIcon: Icon(Icons.store),
              label: 'Mandi',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  final List<Widget> _pages = [
    const Center(child: Text('Home Page')),
    const Center(child: Text('Feed Page')),
    const Center(child: Text('Crop Care Page')),
    const Center(child: Text('Mandi Page')),
    const Center(child: Text('Profile Page')),
  ];

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }
}

class HomeContent extends StatelessWidget {
  final List<Map<String, dynamic>> priority1Ads;
  final List<Map<String, dynamic>> priority2Ads;
  final bool isLoading;

  const HomeContent({
    super.key,
    this.priority1Ads = const [],
    this.priority2Ads = const [],
    this.isLoading = false,
  });

  Widget _buildWeatherItem(IconData icon, String label, String value) {
    return Column(
      children: [
        Icon(icon, color: Colors.white),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return NestedScrollView(
      headerSliverBuilder: (BuildContext context, bool innerBoxIsScrolled) {
        return [
          SliverAppBar(
            expandedHeight: 180.0,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFF4CAF50),
            flexibleSpace: LayoutBuilder(
              builder: (BuildContext context, BoxConstraints constraints) {
                bool isCollapsed =
                    constraints.biggest.height <= kToolbarHeight + 30;

                return FlexibleSpaceBar(
                  background: Container(
                    color: const Color(0xFF4CAF50),
                    child: !isCollapsed
                        ? Column(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              const Padding(
                                padding: EdgeInsets.fromLTRB(16, 50, 16, 0),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Icon(Icons.waving_hand,
                                                color: Color.fromARGB(
                                                    255, 249, 227, 23)),
                                            SizedBox(width: 5),
                                            Text(
                                              'Hello',
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 20,
                                              ),
                                            ),
                                          ],
                                        ),
                                        Text(
                                          'Welcome, Pratik',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        Text(
                                          'Baramati',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 18,
                                          ),
                                        ),
                                      ],
                                    ),
                                    Row(
                                      children: [
                                        Icon(Icons.chat_bubble_outline,
                                            color: Colors.white),
                                        SizedBox(width: 16),
                                        Icon(Icons.notifications_none,
                                            color: Colors.white),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              Padding(
                                padding:
                                    const EdgeInsets.fromLTRB(16, 20, 16, 0),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceAround,
                                  children: [
                                    _buildWeatherItem(
                                        Icons.thermostat, "Temp", "40 C"),
                                    _buildWeatherItem(
                                        Icons.water_drop, "Humidity", "35%"),
                                    _buildWeatherItem(
                                        Icons.cloud, "Cloud", "- - -"),
                                  ],
                                ),
                              ),
                            ],
                          )
                        : null,
                  ),
                  titlePadding: EdgeInsets.zero,
                  title: isCollapsed
                      ? const Padding(
                          padding: EdgeInsets.fromLTRB(16, 16, 16, 0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    'Hello',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                    ),
                                  ),
                                  SizedBox(width: 4),
                                  Icon(Icons.waving_hand,
                                      color: Colors.yellow, size: 16),
                                  SizedBox(width: 4),
                                  Text(
                                    'Welcome, Pratik',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Icon(Icons.chat_bubble_outline,
                                      color: Colors.white, size: 20),
                                  SizedBox(width: 16),
                                  Icon(Icons.notifications_none,
                                      color: Colors.white, size: 20),
                                ],
                              ),
                            ],
                          ),
                        )
                      : Container(),
                );
              },
            ),
          ),
        ];
      },
      body: Container(
        color: const Color(0xFFF5F5F5),
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Center(
                  child: Text(
                    '🌱 Services!',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF008336),
                    ),
                  ),
                ),
                const SizedBox(height: 9),
                if (isLoading)
                  const Center(child: CircularProgressIndicator())
                else
                  AdCarousel(ads: priority1Ads),

                // testonmial
                TestimonialSection(),
                const FacebookPostCard(
                  username: "John Doe",
                  profileImageUrl:
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR7ahvb8aEN76vOIivqeFpa9_gBV5rZm2erw&s",
                  postTime: "2 hours ago",
                  postContent:
                      "Check out this beautiful landscape! Check out this beautiful landscape!Check out this beautiful landscape!Check out this beautiful landscape!Check out this beautiful landscape!",
                  mediaUrl:
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR7ahvb8aEN76vOIivqeFpa9_gBV5rZm2erw&s",
                  mediaType: MediaType.image,
                ),
                AdCarousel(ads: priority2Ads),
                const SizedBox(height: 26),
                const Center(
                  child: Text(
                    'News',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF008336),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                NewsCard(
                  title: 'Major Breakthrough in Renewable Energy Research',
                  imageUrl:
                      'https://images.hindustantimes.com/rf/image_size_960x540/HT/p2/2018/12/26/Pictures/files-india-weather-monsoon_b5f4a298-0917-11e9-8b39-01e96223c804.jpg',
                  content:
                      'Scientists at the University of Technology have developed a new type of solar panel that is 20% more efficient than traditional designs. This breakthrough could significantly reduce the cost of solar power and accelerate the transition to renewable energy.',
                  publishedDate: DateTime(2023, 5, 15),
                ),
                NewsCard(
                  title: 'Major Breakthrough in Renewable Energy Research',
                  imageUrl:
                      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRydbhrDtLoiZYJ8rHtmqTUqxJtxnmQr6i0Pg&s',
                  content:
                      'Scientists at the University of Technology have developed a new type of solar panel that is 20% more efficient than traditional designs. This breakthrough could significantly reduce the cost of solar power and accelerate the transition to renewable energy.',
                  publishedDate: DateTime(2023, 5, 15),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

void main() {
  runApp(const MaterialApp(
    home: FarmerHomePage(),
  ));
}
