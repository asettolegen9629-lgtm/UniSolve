import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/report.dart';
import 'api_config.dart';

class ApiClient {
  Future<List<Report>> fetchReports() async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/reports');
    final response = await http.get(uri, headers: {'Content-Type': 'application/json'});

    if (response.statusCode < 200 || response.statusCode > 299) {
      throw Exception('Failed to load reports (${response.statusCode})');
    }

    final body = jsonDecode(response.body);
    if (body is! List) {
      throw Exception('Unexpected response format');
    }

    return body.map((item) => Report.fromJson(item as Map<String, dynamic>)).toList();
  }
}
