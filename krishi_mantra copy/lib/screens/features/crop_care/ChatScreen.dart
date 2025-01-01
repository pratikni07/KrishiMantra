import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:krishi_mantra/API/CropCareScreemAPI.dart';
import 'package:krishi_mantra/screens/features/crop_care/models/MessageModel.dart';

class ChatScreen extends StatefulWidget {
  final String chatId;
  final String consultantId;
  final String userName;
  final String userProfilePic;

  const ChatScreen({
    Key? key,
    required this.chatId,
    required this.consultantId,
    required this.userName,
    required this.userProfilePic,
  }) : super(key: key);

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final ChatService _chatService = ChatService();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  List<MessageModel> _messages = [];
  bool _isLoading = true;
  int _currentPage = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  Future<void> _loadMessages() async {
    if (!_hasMore) return;

    try {
      final response =
          await _chatService.getChatMessages(widget.chatId, page: _currentPage);
      if (response.statusCode == 200) {
        final List<dynamic> messages = json.decode(response.body);
        final newMessages = messages
            .map((msg) => MessageModel.fromJson(msg, _chatService.userId))
            .toList()
            .reversed // Reverse to show newest messages at bottom
            .toList();

        setState(() {
          _messages.addAll(newMessages);
          _hasMore = newMessages.length == 50;
          _currentPage++;
          _isLoading = false;
        });

        // Scroll to bottom for new messages
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        });
      }
    } catch (e) {
      _showError('Failed to load messages');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _markMessageAsRead(String messageId) async {
    try {
      final response = await _chatService.markMessageAsRead(messageId);
      if (response.statusCode == 200) {
        setState(() {
          final messageIndex = _messages.indexWhere((m) => m.id == messageId);
          if (messageIndex != -1) {
            final updatedMessage = MessageModel(
              id: _messages[messageIndex].id,
              content: _messages[messageIndex].content,
              isSentByMe: _messages[messageIndex].isSentByMe,
              timestamp: _messages[messageIndex].timestamp,
              imageUrl: _messages[messageIndex].imageUrl,
              mediaType: _messages[messageIndex].mediaType,
              senderId: _messages[messageIndex].senderId,
              readBy: [..._messages[messageIndex].readBy, _chatService.userId],
              deliveredTo: _messages[messageIndex].deliveredTo,
            );
            _messages[messageIndex] = updatedMessage;
          }
        });
      }
    } catch (e) {
      print('Error marking message as read: $e');
    }
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;
    final messageContent = _messageController.text.trim();
    _messageController.clear();

    try {
      final response =
          await _chatService.sendMessage(widget.chatId, messageContent);
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final messageData = data['message'] ?? data;

        final newMessage = MessageModel(
          id: messageData['_id'] ?? '',
          content: messageContent,
          isSentByMe: true,
          timestamp: DateTime.now(),
          senderId: _chatService.userId,
          readBy: [],
          deliveredTo: [_chatService.userId],
        );

        setState(() {
          _messages.add(newMessage); // Add to end instead of insert(0)
        });

        // Scroll to bottom after sending
        _scrollToBottom();
      }
    } catch (e) {
      _showError('Failed to send message');
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  Widget _buildMessageStatus(MessageModel message) {
    if (!message.isSentByMe) return SizedBox.shrink();

    if (message.isRead) {
      return Icon(Icons.done_all, size: 16, color: Colors.blue);
    } else if (message.isDelivered) {
      return Icon(Icons.done_all, size: 16, color: Colors.grey);
    } else {
      return Icon(Icons.done, size: 16, color: Colors.grey);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              backgroundImage: NetworkImage(widget.userProfilePic),
            ),
            SizedBox(width: 8),
            Text(widget.userName),
          ],
        ),
      ),
      body: Column(
        children: [
          if (_isLoading) const LinearProgressIndicator(),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              reverse: false,
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[_messages.length - 1 - index];
                return Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Align(
                    alignment: message.isSentByMe
                        ? Alignment.centerRight
                        : Alignment.centerLeft,
                    child: Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: message.isSentByMe
                            ? Colors.blue[100]
                            : Colors.grey[200],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(message.content),
                          SizedBox(height: 4),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _formatTime(message.timestamp),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                              SizedBox(width: 4),
                              _buildMessageStatus(message),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.send),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime time) {
    return '${time.hour}:${time.minute.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
