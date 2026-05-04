import 'package:flutter/material.dart';
import '../models/report.dart';
import '../services/api_client.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/section_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<List<Report>> _reportsFuture;

  @override
  void initState() {
    super.initState();
    _reportsFuture = ApiClient().fetchReports();
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Dashboard',
      subtitle: 'Overview of campus issues',
      child: FutureBuilder<List<Report>>(
        future: _reportsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()));
          }
          if (snapshot.hasError) {
            return SectionCard(
              child: Text(
                'Failed to load: ${snapshot.error}',
                style: const TextStyle(color: Colors.red),
              ),
            );
          }
          final reports = snapshot.data ?? const <Report>[];
          if (reports.isEmpty) {
            return const SectionCard(child: Text('No reports yet'));
          }
          return Column(
            children: reports.take(8).map((report) => _ReportCard(report: report)).toList(),
          );
        },
      ),
    );
  }
}

class _ReportCard extends StatelessWidget {
  final Report report;

  const _ReportCard({required this.report});

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const CircleAvatar(radius: 13, backgroundColor: Color(0xFFEA6A47), child: Text('JD', style: TextStyle(fontSize: 10, color: Colors.white))),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('John Doe', style: TextStyle(fontWeight: FontWeight.w600)),
                  Text('2 hours ago', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            height: 120,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              gradient: const LinearGradient(colors: [Color(0xFF7986FF), Color(0xFF8A6BEA)]),
            ),
          ),
          const SizedBox(height: 10),
          Text(report.title?.isNotEmpty == true ? report.title! : 'Campus issue', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
          const SizedBox(height: 4),
          Text(
            report.description?.isNotEmpty == true ? report.description! : 'Issue details are unavailable.',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.black54),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _pill('Infrastructure', bg: Colors.grey.shade200, fg: Colors.grey.shade700),
              const Spacer(),
              _pill(_statusLabel(report.status), bg: const Color(0xFFFFE1C7), fg: const Color(0xFFEA6A47)),
            ],
          ),
        ],
      ),
    );
  }

  static String _statusLabel(String? status) {
    switch (status?.toLowerCase()) {
      case 'resolved':
      case 'approved':
        return 'Solved';
      case 'pending':
        return 'Pending';
      default:
        return 'Being Solved';
    }
  }

  static Widget _pill(String text, {required Color bg, required Color fg}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(100)),
      child: Text(text, style: TextStyle(fontSize: 12, color: fg, fontWeight: FontWeight.w600)),
    );
  }
}
