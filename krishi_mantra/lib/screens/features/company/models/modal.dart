class Company {
  final String id;
  final String name;
  final String logo;
  final double rating;

  Company({
    required this.id,
    required this.name,
    required this.logo,
    required this.rating,
  });

  factory Company.fromJson(Map<String, dynamic> json) {
    return Company(
      id: json['_id'],
      name: json['name'],
      logo: json['logo'],
      rating: json['rating'].toDouble(),
    );
  }
}
