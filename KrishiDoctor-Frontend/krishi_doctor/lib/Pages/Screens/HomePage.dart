import 'package:flutter/material.dart';
import 'package:krishi_doctor/Pages/components/NewsCard.dart';
import 'package:krishi_doctor/Pages/components/PostCard.dart';
import 'package:krishi_doctor/Pages/components/TestimonialSection.dart';

class FarmerHomePage extends StatefulWidget {
  const FarmerHomePage({super.key});

  @override
  State<FarmerHomePage> createState() => _FarmerHomePageState();
}

class _FarmerHomePageState extends State<FarmerHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Krishi Mantra'),
        backgroundColor: Colors.green,
      ),
      body: Container(
        color: const Color(0xFFF5F5F5), // Background color of body
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Welcome Section
                const Center(
                  child: Text(
                    '🌱 Services!',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF008336), // Adding the green color
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                
                // Services Grid Section
              //  Container(
              //     padding: const EdgeInsets.all(10),
              //     decoration: BoxDecoration(
              //       color: const Color.fromARGB(255, 255, 255, 255),
              //       borderRadius: BorderRadius.circular(10),
              //       // border: Border.all(color: const Color(0xFF008336)),
              //     ),
              //     // height: MediaQuery.of(context).size.height * 0.3,
              //     child: GridView.builder(
              //       gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              //         crossAxisCount: 4, 
              //         crossAxisSpacing: 8,
              //         mainAxisSpacing: 30, 
              //       ),
              //       itemCount: 8, 
              //       itemBuilder: (context, index) {
              //         return Column(
              //           mainAxisAlignment: MainAxisAlignment.center,
              //           children: [
              //             ClipOval(
              //               child: Image.network(
              //                 'https://thumbs.dreamstime.com/b/indian-farmer-empty-hand-product-putting-pointing-finger-174017270.jpg', 
              //                 width: 82, 
              //                 height: 82,
              //                 fit: BoxFit.cover,
              //               ),
              //             ),
              //             const SizedBox(height: 10),
              //             Text(
              //               'Image ${index + 1}',
              //               style: const TextStyle(
              //                 fontSize: 14,
              //                 fontWeight: FontWeight.bold,
              //                 color: const Color(0xFF008336),
              //               ),
              //             ),
              //           ],
              //         );
              //       },
              //       shrinkWrap: true, 
              //       physics: const NeverScrollableScrollPhysics(),
              //     ),
              //   ),

                const SizedBox(height: 16),


                // Ads Section 
                Container(
                  child: Image.network(
                          'https://yojnaias.com/wp-content/uploads/2023/04/PM-KISAN.png', 
                          fit: BoxFit.cover,
                  ),
                ),

          
                // TOP POST SECTION 

                // Testinomial 
                TestimonialSection(),

                // Example with an image
                const FacebookPostCard(
                  username: "John Doe",
                  profileImageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR7ahvb8aEN76vOIivqeFpa9_gBV5rZm2erw&s",
                  postTime: "2 hours ago",
                  postContent: "Check out this beautiful landscape! Check out this beautiful landscape!Check out this beautiful landscape!Check out this beautiful landscape!Check out this beautiful landscape!",
                  mediaUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR7ahvb8aEN76vOIivqeFpa9_gBV5rZm2erw&s",
                  mediaType: MediaType.image,
                ),

                // // Example with a video
                // const FacebookPostCard(
                //   username: "Jane Smith",
                //   profileImageUrl: "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
                //   postTime: "1 hour ago",
                //   postContent: "My latest travel vlog!",
                //   mediaUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                //   mediaType: MediaType.video,
                // ),

                // // Example without media
                // const FacebookPostCard(
                //   username: "User",
                //   profileImageUrl: "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
                //   postTime: "Just now",
                //   postContent: "Just thinking out loud...",
                //   mediaType: MediaType.none,
                // ),
               
               // Ads Section 
                Container(
                  child: Image.network(
                          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReOD9y7ioHCt1dsX7uX41otL_fIWZxgE6SPA&s', 
                          fit: BoxFit.cover,
                  ),
                ),
                

                const SizedBox(height: 26),
                //  News Section 
                const Center(
                  child: Text(
                    'News',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF008336), // Adding the green color
                    ),
                  ),
                ),

                const SizedBox(height: 20),
                NewsCard(
                  title: 'Major Breakthrough in Renewable Energy Research',
                  imageUrl: 'https://images.hindustantimes.com/rf/image_size_960x540/HT/p2/2018/12/26/Pictures/files-india-weather-monsoon_b5f4a298-0917-11e9-8b39-01e96223c804.jpg',
                  content: 'Scientists at the University of Technology have developed a new type of solar panel that is 20% more efficient than traditional designs. This breakthrough could significantly reduce the cost of solar power and accelerate the transition to renewable energy.',
                  publishedDate: DateTime(2023, 5, 15),
                ),
                 NewsCard(
                  title: 'Major Breakthrough in Renewable Energy Research',
                  imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRydbhrDtLoiZYJ8rHtmqTUqxJtxnmQr6i0Pg&s',
                  content: 'Scientists at the University of Technology have developed a new type of solar panel that is 20% more efficient than traditional designs. This breakthrough could significantly reduce the cost of solar power and accelerate the transition to renewable energy.',
                  publishedDate: DateTime(2023, 5, 15),
                ),




                // // Quick Actions Section
                // const Text(
                //   'Quick Actions',
                //   style: TextStyle(
                //     fontSize: 20,
                //     fontWeight: FontWeight.bold,
                //   ),
                // ),
                // const SizedBox(height: 8),
                // Row(
                //   mainAxisAlignment: MainAxisAlignment.spaceBetween,
                //   children: [
                //     ElevatedButton(
                //       onPressed: () {},
                //       style: ElevatedButton.styleFrom(
                //         backgroundColor: Colors.green,
                //       ),
                //       child: const Text('Buy Seeds'),
                //     ),
                //     ElevatedButton(
                //       onPressed: () {},
                //       style: ElevatedButton.styleFrom(
                //         backgroundColor: Colors.green,
                //       ),
                //       child: const Text('Sell Crops'),
                //     ),
                //     ElevatedButton(
                //       onPressed: () {},
                //       style: ElevatedButton.styleFrom(
                //         backgroundColor: Colors.green,
                //       ),
                //       child: const Text('Contact Expert'),
                //     ),
                //   ],
                // ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

void main() {
  runApp(MaterialApp(
    home: FarmerHomePage(),
  ));
}
