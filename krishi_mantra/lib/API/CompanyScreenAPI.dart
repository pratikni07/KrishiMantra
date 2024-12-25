import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl = 'http://localhost:3001/api';
  final String _token = 'your_token';
  // API endpoint
  final String _GET_ALL_COMPANY = '/main/companies';

  // GET request
  Future<http.Response> getAllCompany() async {
    final Uri _url = Uri.parse('$baseUrl$_GET_ALL_COMPANY');

    final headers = {
      'Authorization': 'Bearer $_token',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final http.Response response = await http.get(
      _url,
      headers: headers,
    );
    return response;
  }
}
