import 'package:flutter/material.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/section_card.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = const [
      ('AD', 'Admin commented', 'We\'ve assigned a maintenance team for broken lights.', '2 hours ago'),
      ('SL', 'Sarah Lee commented', 'I\'ve noticed the same issue in Building B.', '5 hours ago'),
      ('AD', 'Admin updated', 'Marked your report as Solved.', '1 day ago'),
    ];

    return AppScaffold(
      title: 'Notifications',
      subtitle: 'Updates and comments',
      child: Column(
        children: items
            .map(
              (item) => SectionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 14,
                          backgroundColor: const Color(0xFFEA6A47),
                          child: Text(item.$1, style: const TextStyle(fontSize: 11, color: Colors.white)),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.$2, style: const TextStyle(fontWeight: FontWeight.w600)),
                              const SizedBox(height: 4),
                              Text(item.$3, style: const TextStyle(color: Colors.black54)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(item.$4, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}
