class Report {
  final int id;
  final String? title;
  final String? description;
  final String? status;
  final String? createdAt;

  const Report({
    required this.id,
    this.title,
    this.description,
    this.status,
    this.createdAt,
  });

  factory Report.fromJson(Map<String, dynamic> json) {
    return Report(
      id: json['id'] as int,
      title: json['title'] as String?,
      description: json['description'] as String?,
      status: json['status'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }
}
