import 'package:flutter/material.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/section_card.dart';

class FeedbackScreen extends StatelessWidget {
  const FeedbackScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = const [
      ('Resolved on Oct 20', 'Cafeteria tables repair - All tables have been fixed and are now stable.', 'Facilities'),
      ('Resolved on Oct 18', 'Trash bins near entrance - Maintenance team has cleaned all bins and added more.', 'Sanitation'),
    ];

    return AppScaffold(
      title: 'Feedback',
      subtitle: 'Rate resolved issues',
      child: Column(
        children: items
            .map(
              (item) => SectionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const CircleAvatar(
                          radius: 13,
                          backgroundColor: Color(0xFFEA6A47),
                          child: Text('JD', style: TextStyle(fontSize: 10, color: Colors.white)),
                        ),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Your Report', style: TextStyle(fontWeight: FontWeight.w600)),
                            Text(item.$1, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(item.$2, style: const TextStyle(color: Colors.black54)),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(100)),
                          child: Text(item.$3, style: TextStyle(color: Colors.grey.shade700, fontSize: 12, fontWeight: FontWeight.w600)),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(color: Colors.green.withOpacity(0.15), borderRadius: BorderRadius.circular(100)),
                          child: const Text('Solved', style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: () {},
                        style: FilledButton.styleFrom(backgroundColor: const Color(0xFFEA6A47)),
                        child: const Text('Rate'),
                      ),
                    ),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}
