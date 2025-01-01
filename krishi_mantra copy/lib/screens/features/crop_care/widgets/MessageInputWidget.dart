import 'package:flutter/material.dart';

class MessageInputWidget extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSend;
  final VoidCallback onAttachmentTap;

  const MessageInputWidget({
    Key? key,
    required this.controller,
    required this.onSend,
    required this.onAttachmentTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.attach_file),
            onPressed: onAttachmentTap,
          ),
          Expanded(
            child: TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: 'Type a message',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.send),
            onPressed: onSend,
          ),
        ],
      ),
    );
  }
}
