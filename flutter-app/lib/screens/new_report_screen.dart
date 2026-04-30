import 'package:flutter/material.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/section_card.dart';

class NewReportScreen extends StatefulWidget {
  const NewReportScreen({super.key});

  @override
  State<NewReportScreen> createState() => _NewReportScreenState();
}

class _NewReportScreenState extends State<NewReportScreen> {
  final _descriptionController = TextEditingController();
  String _category = 'Infrastructure';
  bool _anonymous = false;

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'New Report',
      subtitle: 'Submit a campus issue',
      child: SectionCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Upload Photo', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.attach_file),
              label: const Text('Choose file'),
            ),
            const SizedBox(height: 14),
            const Text('Description', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            TextField(
              controller: _descriptionController,
              maxLines: 5,
              decoration: const InputDecoration(
                hintText: 'Describe the issue in detail...',
                filled: true,
                fillColor: Color(0xFFF2F3F5),
                border: OutlineInputBorder(borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 14),
            const Text('Category', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _category,
              items: const ['Infrastructure', 'Facilities', 'Safety', 'Sanitation', 'Other']
                  .map((item) => DropdownMenuItem(value: item, child: Text(item)))
                  .toList(),
              onChanged: (value) => setState(() => _category = value ?? _category),
              decoration: const InputDecoration(
                filled: true,
                fillColor: Color(0xFFF2F3F5),
                border: OutlineInputBorder(borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 8),
            CheckboxListTile(
              value: _anonymous,
              onChanged: (value) => setState(() => _anonymous = value ?? false),
              title: const Text('Submit anonymously'),
              dense: true,
              contentPadding: EdgeInsets.zero,
              controlAffinity: ListTileControlAffinity.leading,
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Report submitted')));
                },
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFFEA6A47)),
                child: const Text('Submit Report'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
