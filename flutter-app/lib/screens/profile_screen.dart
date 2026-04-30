import 'package:flutter/material.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/section_card.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool darkMode = false;
  bool notifications = true;

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Profile',
      subtitle: 'Manage your account',
      child: Column(
        children: [
          const SectionCard(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 34,
                  backgroundColor: Color(0xFFEA6A47),
                  child: Text('JD', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 24)),
                ),
                SizedBox(height: 10),
                Text('John Doe', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
                SizedBox(height: 4),
                Text('john.doe@university.edu', style: TextStyle(color: Colors.grey)),
              ],
            ),
          ),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Settings', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                const SizedBox(height: 6),
                SwitchListTile(
                  title: const Text('Dark Mode'),
                  value: darkMode,
                  onChanged: (value) => setState(() => darkMode = value),
                ),
                SwitchListTile(
                  title: const Text('Notifications'),
                  value: notifications,
                  onChanged: (value) => setState(() => notifications = value),
                ),
              ],
            ),
          ),
          const SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Your Stats', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                SizedBox(height: 10),
                _StatRow(title: 'Reports submitted', value: '12'),
                _StatRow(title: 'Resolved', value: '8'),
                _StatRow(title: 'Feedback sent', value: '5'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  final String title;
  final String value;

  const _StatRow({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(title, style: const TextStyle(color: Colors.grey)),
          const Spacer(),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
