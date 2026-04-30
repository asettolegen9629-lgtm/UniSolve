import SwiftUI

struct NewReportView: View {
    @State private var description = ""
    @State private var category = "Infrastructure"
    @State private var submitAnonymously = false
    @State private var sent = false

    private let categories = ["Infrastructure", "Facilities", "Safety", "Sanitation", "Other"]

    var body: some View {
        AppScaffold(title: "New Report", subtitle: "Submit a campus issue") {
            VStack(alignment: .leading, spacing: 12) {
                Text("Upload Photo")
                    .font(.subheadline.weight(.medium))
                Button {
                    // TODO: Replace with PhotosPicker + multipart upload
                } label: {
                    HStack {
                        Image(systemName: "paperclip")
                        Text("Choose file")
                    }
                    .font(.subheadline)
                    .padding(.vertical, 10)
                    .frame(maxWidth: .infinity)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }

                Text("Description")
                    .font(.subheadline.weight(.medium))
                TextEditor(text: $description)
                    .frame(height: 120)
                    .padding(8)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 10))

                Text("Category")
                    .font(.subheadline.weight(.medium))
                Picker("Category", selection: $category) {
                    ForEach(categories, id: \.self) { item in
                        Text(item).tag(item)
                    }
                }
                .pickerStyle(.menu)
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 10))

                Toggle("Submit anonymously", isOn: $submitAnonymously)
                    .font(.subheadline)

                Button {
                    sent = true
                } label: {
                    Text("Submit Report")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.orange)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
            .padding(12)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
        .alert("Report submitted", isPresented: $sent) {
            Button("OK", role: .cancel) {}
        }
    }
}
