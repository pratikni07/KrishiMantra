import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:krishi_mantra/API/CropCareScreemAPI.dart';
import 'package:krishi_mantra/screens/features/crop_care/ChatScreen.dart';

class ChatListScreen extends StatefulWidget {
  @override
  _ChatListScreenState createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final ChatService _chatService = ChatService();
  List<ChatPreview> _chats = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadChats();
  }

  Future<void> _loadChats() async {
    try {
      final response = await _chatService.getChatList();
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _chats = data.map((json) => ChatPreview.fromJson(json)).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load chats: $e')),
      );
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chats'),
        backgroundColor: Colors.green.shade500,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _chats.length,
              itemBuilder: (context, index) {
                final chat = _chats[index];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundImage:
                        NetworkImage('https://placekitten.com/200/200'),
                  ),
                  title: Text(chat.participantId),
                  subtitle: Text(chat.lastMessage ?? 'No messages yet'),
                  trailing: Text(
                    _formatTime(chat.lastMessageTime),
                    style: TextStyle(color: Colors.grey),
                  ),
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ChatScreen(
                        chatId: chat.id,
                        consultantId: chat.participantId,
                        userName: chat.participantId,
                        userProfilePic: 'https://placekitten.com/200/200',
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }

  String _formatTime(DateTime? time) {
    if (time == null) return '';
    final now = DateTime.now();
    if (now.difference(time).inDays == 0) {
      return '${time.hour}:${time.minute.toString().padLeft(2, '0')}';
    }
    return '${time.day}/${time.month}';
  }
}

class ChatPreview {
  final String id;
  final String participantId;
  final String? lastMessage;
  final DateTime? lastMessageTime;

  ChatPreview({
    required this.id,
    required this.participantId,
    this.lastMessage,
    this.lastMessageTime,
  });

  factory ChatPreview.fromJson(Map<String, dynamic> json) {
    final lastMessageDetails =
        (json['lastMessageDetails'] as List?)?.isNotEmpty == true
            ? json['lastMessageDetails'][0]
            : null;

    final participants = (json['participants'] as List?)
            ?.where((p) => p != "67554c6e9fd16ef80ae96828")
            .toList() ??
        [];

    return ChatPreview(
      id: json['_id'] ?? '',
      participantId:
          participants.isNotEmpty ? participants[0].toString() : 'Unknown',
      lastMessage: lastMessageDetails?['content'] as String?,
      lastMessageTime: lastMessageDetails?['createdAt'] != null
          ? DateTime.parse(lastMessageDetails['createdAt'].toString())
          : null,
    );
  }
}
