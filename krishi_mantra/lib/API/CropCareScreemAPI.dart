// chat_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ChatService {
  final String baseUrl = 'http://localhost:3004/api';
  final String _token = 'your_token';
  final String userId = "67554c6e9fd16ef80ae96828";

  Future<http.Response> createDirectChat(String participantId) async {
    final url = Uri.parse('$baseUrl/chat/direct');
    return await http.post(
      url,
      headers: _getHeaders(),
      body: jsonEncode({
        'participantId': participantId,
        'userId': userId,
      }),
    );
  }

  Future<http.Response> getChatMessages(String chatId,
      {int page = 1, int limit = 50}) async {
    final url =
        Uri.parse('$baseUrl/chat/$chatId/messages?page=$page&limit=$limit');
    // print url);
    return await http.post(
      url,
      headers: _getHeaders(),
      body: jsonEncode({
        'userId': userId,
      }),
    );
  }

  Future<http.Response> markMessageAsRead(String messageId) async {
    final url = Uri.parse('$baseUrl/message/$messageId/read');
    return await http.post(
      url,
      headers: _getHeaders(),
      body: jsonEncode({
        'userId': userId,
      }),
    );
  }

  Future<http.Response> getChatList({int page = 1, int limit = 20}) async {
    final url = Uri.parse('$baseUrl/chat/list?page=$page&limit=$limit');
    return await http.post(
      url,
      headers: _getHeaders(),
      body: jsonEncode({
        'userId': userId,
      }),
    );
  }

  Future<http.Response> sendMessage(String chatId, String content,
      {String? mediaUrl}) async {
    final url = Uri.parse('$baseUrl/message/send');
    final body = {
      'userId': userId,
      'chatId': chatId,
      'content': content,
      'mediaType': mediaUrl != null ? _getMediaType(mediaUrl) : 'text',
    };
    if (mediaUrl != null) {
      body['mediaUrl'] = mediaUrl;
    }

    print('Sending message: $body'); // Debug log
    return await http.post(
      url,
      headers: _getHeaders(),
      body: jsonEncode(body),
    );
  }

  Map<String, String> _getHeaders() => {
        'Authorization': 'Bearer $_token',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

  String _getMediaType(String url) {
    final extension = url.split('.').last.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].contains(extension)) return 'image';
    if (['mp4', 'mov', 'avi'].contains(extension)) return 'video';
    return 'file';
  }
}
