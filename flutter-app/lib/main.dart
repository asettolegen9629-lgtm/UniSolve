import 'package:flutter/material.dart';
import 'screens/dashboard_screen.dart';
import 'screens/feedback_screen.dart';
import 'screens/new_report_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/profile_screen.dart';

void main() {
  runApp(const UniSloveApp());
}

class UniSloveApp extends StatelessWidget {
  const UniSloveApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UniSolve',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFEA6A47)),
        scaffoldBackgroundColor: const Color(0xFFF4F5F7),
        useMaterial3: true,
      ),
      home: const AppShell(),
    );
  }
}

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    NotificationsScreen(),
    NewReportScreen(),
    FeedbackScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        indicatorColor: Colors.orange.withOpacity(0.2),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.notifications_outlined), selectedIcon: Icon(Icons.notifications), label: 'Alerts'),
          NavigationDestination(icon: Icon(Icons.add_circle_outline), selectedIcon: Icon(Icons.add_circle), label: 'New'),
          NavigationDestination(icon: Icon(Icons.star_outline), selectedIcon: Icon(Icons.star), label: 'Feedback'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
        onDestinationSelected: (value) {
          setState(() {
            _index = value;
          });
        },
      ),
    );
  }
}
