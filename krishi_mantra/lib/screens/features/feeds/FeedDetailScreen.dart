import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';

class AgriPostScreen extends StatefulWidget {
  const AgriPostScreen({super.key});

  @override
  State<AgriPostScreen> createState() => _AgriPostScreenState();
}

class _AgriPostScreenState extends State<AgriPostScreen> {
  final TextEditingController _commentController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  int _currentImageIndex = 0;
  String? _replyingTo;

  // Demo data
  final List<String> demoImages = [
    'https://media.istockphoto.com/id/543212762/photo/tractor-cultivating-field-at-spring.jpg?s=612x612&w=0&k=20&c=uJDy7MECNZeHDKfUrLNeQuT7A1IqQe89lmLREhjIJYU=',
    'https://plus.unsplash.com/premium_photo-1661880897225-e08abbe1d53c?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmFybSUyMGZpZWxkfGVufDB8fDB8fHww',
    'https://static.vecteezy.com/system/resources/thumbnails/023/060/798/small/farming-tractor-spraying-plants-in-a-field-photo.jpg',
  ];

  final Map<String, dynamic> postData = {
    'userImage': 'https://example.com/user.jpg',
    'userName': 'Pratik Nikat',
    'location': 'Baramati',
    'content':
        'गहू पिकावर किडीचा प्रादुर्भाव झाला आहे. कोणते कीटकनाशक वापरावे?',
    'description':
        'गहू पिकावर कीड पडल्याने पाने कुरतडलेली आणि पिवळसर दिसत आहेत. कीड नियंत्रणासाठी योग्य कीटकनाशके किंवा संदेश उपाय सुचवा, तसेच भविष्यातील प्रतिबंधक उपायांची माहिती द्या.',
  };

  final List<Map<String, dynamic>> comments = [
    {
      'userImage': 'https://example.com/user2.jpg',
      'userName': 'Sunil Nikat',
      'timeAgo': '9 Hr Ago',
      'comment':
          'इमिडाक्लोप्रिड 17.8% SL (0.5 मिली/लिटर पाणी) किंवा क्लोरपायरीफॉस 20% EC (2 मिली/लिटर पाणी) यापैकी एक फवारा',
      'replies': 2,
    }
  ];

  void _handleReply(String userName) {
    setState(() {
      _replyingTo = userName;
      _commentController.text = '@$userName ';
      _commentController.selection = TextSelection.fromPosition(
        TextPosition(offset: _commentController.text.length),
      );
    });
    // Scroll to bottom and focus the input
    Future.delayed(const Duration(milliseconds: 100), () {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
      FocusScope.of(context).requestFocus();
    });
  }

  void _cancelReply() {
    setState(() {
      _replyingTo = null;
      _commentController.clear();
    });
  }

  Widget _buildCarousel() {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CarouselSlider.builder(
            itemCount: demoImages.length,
            options: CarouselOptions(
              aspectRatio: 16 / 9,
              viewportFraction: 1.0,
              enlargeCenterPage: false,
              enableInfiniteScroll: false,
              onPageChanged: (index, reason) {
                setState(() {
                  _currentImageIndex = index;
                });
              },
            ),
            itemBuilder: (context, index, realIndex) {
              return Container(
                width: MediaQuery.of(context).size.width,
                color: Colors.grey[100],
                child: Image.network(
                  demoImages[index],
                  fit: BoxFit.cover,
                ),
              );
            },
          ),
          if (demoImages.length > 1) ...[
            Positioned(
              left: 10,
              child: _carouselButton(
                Icons.arrow_back_ios,
                () {
                  if (_currentImageIndex > 0) {
                    setState(() {
                      _currentImageIndex--;
                    });
                  }
                },
              ),
            ),
            Positioned(
              right: 10,
              child: _carouselButton(
                Icons.arrow_forward_ios,
                () {
                  if (_currentImageIndex < demoImages.length - 1) {
                    setState(() {
                      _currentImageIndex++;
                    });
                  }
                },
              ),
            ),
          ],
          Positioned(
            bottom: 10,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: demoImages.asMap().entries.map((entry) {
                return Container(
                  width: 8.0,
                  height: 8.0,
                  margin: const EdgeInsets.symmetric(horizontal: 3.0),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(
                      _currentImageIndex == entry.key ? 0.9 : 0.4,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUserInfo() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          CircleAvatar(
            backgroundImage: NetworkImage(postData['userImage']),
            radius: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  postData['userName'],
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  postData['location'],
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
            child: const Text('FOLLOW'),
          ),
        ],
      ),
    );
  }

  Widget _buildPostContent() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            postData['content'],
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            postData['description'],
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.favorite_border),
                onPressed: () {},
                color: Colors.black87,
              ),
              IconButton(
                icon: const Icon(Icons.bookmark_border),
                onPressed: () {},
                color: Colors.black87,
              ),
              IconButton(
                icon: const Icon(Icons.share),
                onPressed: () {},
                color: Colors.black87,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildComments() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: comments.length,
      itemBuilder: (context, index) {
        final comment = comments[index];
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    backgroundImage: NetworkImage(comment['userImage']),
                    radius: 16,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              comment['userName'],
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              comment['timeAgo'],
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(comment['comment']),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            GestureDetector(
                              onTap: () => _handleReply(comment['userName']),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.reply,
                                    size: 16,
                                    color: Colors.grey[600],
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Reply',
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (comment['replies'] != null) ...[
                              const SizedBox(width: 12),
                              Text(
                                '${comment['replies']} replies',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.more_vert, color: Colors.black87),
                    onPressed: () {},
                  ),
                ],
              ),
            ),
            if (index < comments.length - 1)
              const Divider(height: 1, color: Colors.black12),
          ],
        );
      },
    );
  }

  Widget _buildCommentInput() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, -1),
          ),
        ],
      ),
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 12,
        bottom: MediaQuery.of(context).padding.bottom + 12,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_replyingTo != null)
            Container(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  Text(
                    'Replying to $_replyingTo',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 12,
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: _cancelReply,
                    child: Icon(
                      Icons.close,
                      size: 16,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _commentController,
                  decoration: InputDecoration(
                    hintText: 'Add a comment...',
                    hintStyle: TextStyle(color: Colors.grey[400]),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(25),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Colors.grey[50],
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.green,
                  borderRadius: BorderRadius.circular(25),
                ),
                child: IconButton(
                  icon: const Icon(Icons.send, size: 20),
                  color: Colors.white,
                  onPressed: () {
                    if (_commentController.text.isNotEmpty) {
                      // Add comment logic here
                      _cancelReply();
                    }
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _carouselButton(IconData icon, VoidCallback onPressed) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.5),
        shape: BoxShape.circle,
      ),
      child: IconButton(
        icon: Icon(icon, color: Colors.white, size: 20),
        onPressed: onPressed,
        padding: const EdgeInsets.all(8),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildCarousel(),
                  _buildUserInfo(),
                  _buildPostContent(),
                  const Divider(height: 1, color: Colors.black12),
                  _buildComments(),
                  const SizedBox(height: 80), // Space for fixed comment input
                ],
              ),
            ),
          ),
          _buildCommentInput(),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _commentController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
