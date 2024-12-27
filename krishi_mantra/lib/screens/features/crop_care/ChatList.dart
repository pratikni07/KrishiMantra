import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:krishi_mantra/API/ConsultantScreenAPI.dart';
import 'package:krishi_mantra/screens/features/crop_care/ChatScreen.dart';

// Define your custom colors here
const Color primaryColor = Color(0xFF31A05F); // Primary color for the app
const Color backgroundColor = Colors.white; // Background color for the app
const Color headerTextColor = Colors.white; // Text color for the header
const Color searchFieldBackgroundColor =
    Colors.white; // Background color for the search field
const Color searchFieldIconColor =
    Colors.grey; // Icon color in the search field
const Color subtitleTextColor =
    Colors.grey; // Subtitle text color in the consultant list
const Color ratingStarColor = Colors.amber; // Star color for ratings
const Color floatingActionButtonColor = primaryColor; // FAB color
const Color greyTextColor = Colors.grey; // Grey text color

class Consultant {
  final int id;
  final String name;
  final double rating;
  final String specialty;
  final String photoUrl;
  final bool isAvailable;

  Consultant({
    required this.id,
    required this.name,
    required this.rating,
    required this.specialty,
    required this.photoUrl,
    this.isAvailable = true,
  });
}

class ConsultantFromApi {
  final String userName;
  final String profilePhotoId;
  final int experience;
  final double rating;
  final Company company;

  ConsultantFromApi({
    required this.userName,
    required this.profilePhotoId,
    required this.experience,
    required this.rating,
    required this.company,
  });

  factory ConsultantFromApi.fromJson(Map<String, dynamic> json) {
    return ConsultantFromApi(
      userName: json['userName'],
      profilePhotoId: json['profilePhotoId'],
      experience: json['experience'],
      rating: json['rating'].toDouble(),
      company: Company.fromJson(json['company']),
    );
  }
}

class Company {
  final String name;
  final String logo;

  Company({
    required this.name,
    required this.logo,
  });

  factory Company.fromJson(Map<String, dynamic> json) {
    return Company(
      name: json['name'],
      logo: json['logo'],
    );
  }
}

class MoreConsultantsModal extends StatefulWidget {
  const MoreConsultantsModal({super.key});

  @override
  _MoreConsultantsModalState createState() => _MoreConsultantsModalState();
}

class _MoreConsultantsModalState extends State<MoreConsultantsModal> {
  final ApiService _apiService = ApiService();
  List<ConsultantFromApi> availableConsultants = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadConsultants();
  }

  Future<void> _loadConsultants() async {
    try {
      final response =
          await _apiService.getConsultantByLocation(18.6500, 73.7286);
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          availableConsultants = (data['consultants'] as List)
              .map((json) => ConsultantFromApi.fromJson(json))
              .toList();
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load consultants');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading consultants: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(16),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Available Consultants',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              if (isLoading)
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          if (!isLoading) ...[
            ...availableConsultants.map(
              (consultant) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundImage: NetworkImage(consultant.profilePhotoId),
                  ),
                  title: Text(
                    consultant.userName,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        consultant.company.name,
                        style:
                            const TextStyle(fontSize: 14, color: greyTextColor),
                      ),
                      Text(
                        '${consultant.experience} years experience',
                        style:
                            const TextStyle(fontSize: 12, color: greyTextColor),
                      ),
                    ],
                  ),
                  trailing: Text(
                    '★ ${consultant.rating}',
                    style: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Added ${consultant.userName}')),
                    );
                  },
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class ConsultantListScreen extends StatefulWidget {
  @override
  _ConsultantListScreenState createState() => _ConsultantListScreenState();
}

class _ConsultantListScreenState extends State<ConsultantListScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Consultant> consultants = [
    Consultant(
      id: 1,
      name: 'Dr. Sarah Smith',
      rating: 4.8,
      specialty: 'Crop Management',
      photoUrl: 'https://placeholder.com/48x48',
    ),
    Consultant(
      id: 2,
      name: 'John Peterson',
      rating: 4.5,
      specialty: 'Soil Analysis',
      photoUrl: 'https://placeholder.com/48x48',
    ),
    Consultant(
      id: 3,
      name: 'Maria Garcia',
      rating: 4.9,
      specialty: 'Organic Farming',
      photoUrl: 'https://placeholder.com/48x48',
    ),
    Consultant(
      id: 4,
      name: 'Dr. Alex Kumar',
      rating: 4.7,
      specialty: 'Pest Control',
      photoUrl: 'https://placeholder.com/48x48',
    ),
  ];

  List<Consultant> get filteredConsultants => consultants
      .where((consultant) => consultant.name
          .toLowerCase()
          .contains(_searchController.text.toLowerCase()))
      .toList();

  void _showMoreConsultants() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => MoreConsultantsModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: Column(
        children: [
          Container(
            padding:
                const EdgeInsets.only(top: 60, left: 16, right: 16, bottom: 16),
            color: primaryColor,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Consultants',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: headerTextColor,
                      ),
                    ),
                    PopupMenuButton<String>(
                      icon: const Icon(Icons.more_vert, color: headerTextColor),
                      onSelected: (String choice) {
                        if (choice == 'Add') {
                          _showMoreConsultants();
                        }
                      },
                      itemBuilder: (BuildContext context) => [
                        const PopupMenuItem<String>(
                          value: 'Add',
                          child: Row(
                            children: [
                              Icon(Icons.add),
                              SizedBox(width: 8),
                              Text('Add Consultant'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _searchController,
                  onChanged: (value) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Search consultants...',
                    prefixIcon:
                        const Icon(Icons.search, color: searchFieldIconColor),
                    filled: true,
                    fillColor: searchFieldBackgroundColor,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: filteredConsultants.length,
              itemBuilder: (context, index) {
                final consultant = filteredConsultants[index];
                return Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(
                      radius: 24,
                      backgroundImage: NetworkImage(consultant.photoUrl),
                    ),
                    title: Text(
                      consultant.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    subtitle: Text(
                      consultant.specialty,
                      style: const TextStyle(
                          fontSize: 14, color: subtitleTextColor),
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star,
                            color: ratingStarColor, size: 20),
                        const SizedBox(width: 4),
                        Text(
                          consultant.rating.toString(),
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                      ],
                    ),
                    onTap: () {
                      ChatScreen(
                          userName: consultant.name,
                          userProfilePic: consultant.photoUrl);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showMoreConsultants,
        backgroundColor: floatingActionButtonColor,
        child: const Icon(Icons.add),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
