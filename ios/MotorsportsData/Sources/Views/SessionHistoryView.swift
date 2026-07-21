import SwiftUI
import CoreData

struct SessionHistoryView: View {
    @Environment(\.managedObjectContext) var viewContext
    @FetchRequest(
        entity: CDRacingSession.entity(),
        sortDescriptors: [NSSortDescriptor(keyPath: \CDRacingSession.sessionDate, ascending: false)]
    ) var sessions: FetchedResults<CDRacingSession>
    
    @StateObject var uploadManager = UploadManager.shared
    @State var selectedSession: CDRacingSession?
    @State var showUploadAlert = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 0.03, green: 0.03, blue: 0.05).ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        VStack(alignment: .leading) {
                            Text("SESSION HISTORY")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Text("\(sessions.count) Sessions")
                                .font(.headline)
                                .foregroundColor(.white)
                        }
                        Spacer()
                        if uploadManager.isUploading {
                            HStack(spacing: 8) {
                                ProgressView(value: uploadManager.uploadProgress)
                                    .tint(Color(red: 0.84, green: 0.97, blue: 0.20))
                                    .frame(width: 100)
                                Text("\(Int(uploadManager.uploadProgress * 100))%")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .padding(16)
                    .background(Color(red: 0.08, green: 0.08, blue: 0.12))
                    .border(Color(red: 0.15, green: 0.15, blue: 0.20), width: 1)
                    
                    if sessions.isEmpty {
                        emptyStateView
                    } else {
                        ScrollView {
                            VStack(spacing: 8) {
                                ForEach(sessions, id: \.id) { session in
                                    sessionRow(session)
                                }
                            }
                            .padding(12)
                        }
                    }
                    
                    if let error = uploadManager.lastUploadError {
                        HStack {
                            Image(systemName: "exclamationmark.circle.fill")
                                .foregroundColor(.red)
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                        .padding(8)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(4)
                        .padding(12)
                    }
                }
            }
            .navigationTitle("History")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "list.bullet")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("No Sessions Yet")
                .font(.headline)
                .foregroundColor(.white)
            Text("Log your first track session to see it here")
                .font(.caption)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
            
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(32)
    }
    
    private func sessionRow(_ session: CDRacingSession) -> some View {
        VStack(spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(session.trackName)
                        .font(.headline)
                        .foregroundColor(.white)
                    HStack(spacing: 8) {
                        Text(session.discipline.capitalized)
                            .font(.caption)
                            .foregroundColor(.gray)
                        Divider()
                            .frame(height: 12)
                        Text(formatDate(session.sessionDate))
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: session.synced ? "checkmark.circle.fill" : "exclamationmark.circle")
                            .font(.caption)
                            .foregroundColor(session.synced ? Color(red: 0.84, green: 0.97, blue: 0.20) : Color.orange)
                        Text(session.synced ? "Synced" : "Pending")
                            .font(.caption)
                            .foregroundColor(session.synced ? Color(red: 0.84, green: 0.97, blue: 0.20) : Color.orange)
                    }
                    
                    if let bestLap = session.bestLapSeconds as? Double {
                        Text("\(String(format: "%.2f", bestLap))s")
                            .font(.system(.caption, design: .monospaced))
                            .foregroundColor(.cyan)
                    }
                }
            }
            
            HStack(spacing: 8) {
                Button(action: {
                    selectedSession = session
                }) {
                    Label("Details", systemImage: "eye")
                        .font(.caption)
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(8)
                        .background(Color(red: 0.84, green: 0.97, blue: 0.20))
                        .cornerRadius(4)
                }
                
                if !session.synced {
                    Button(action: {
                        uploadSession(session)
                    }) {
                        Label("Upload", systemImage: "arrow.up.circle")
                            .font(.caption)
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .padding(8)
                            .background(Color(red: 0.84, green: 0.97, blue: 0.20))
                            .cornerRadius(4)
                    }
                }
                
                Button(action: {
                    deleteSession(session)
                }) {
                    Label("Delete", systemImage: "trash")
                        .font(.caption)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(8)
                        .background(Color.red)
                        .cornerRadius(4)
                }
            }
        }
        .padding(12)
        .background(Color(red: 0.08, green: 0.08, blue: 0.12))
        .border(Color(red: 0.15, green: 0.15, blue: 0.20), width: 1)
        .cornerRadius(8)
        .sheet(item: $selectedSession) { session in
            SessionDetailView(session: session)
        }
    }
    
    private func uploadSession(_ session: CDRacingSession) {
        Task {
            do {
                try await uploadManager.uploadSession(session)
                showUploadAlert = true
            } catch {
                print("[SessionHistory] Upload error: \(error)")
            }
        }
    }
    
    private func deleteSession(_ session: CDRacingSession) {
        PersistenceManager.shared.deleteSession(session)
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, h:mm a"
        return formatter.string(from: date)
    }
}

struct SessionDetailView: View {
    let session: CDRacingSession
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 0.03, green: 0.03, blue: 0.05).ignoresSafeArea()
                
                VStack(spacing: 16) {
                    Form {
                        Section(header: Text("Session Info")) {
                            DetailRow(label: "Track", value: session.trackName)
                            DetailRow(label: "Discipline", value: session.discipline.capitalized)
                            DetailRow(label: "Date", value: formatDate(session.sessionDate))
                            DetailRow(label: "Conditions", value: session.conditions?.capitalized ?? "Unknown")
                        }
                        
                        Section(header: Text("Performance")) {
                            if let bestLap = session.bestLapSeconds as? Double {
                                DetailRow(label: "Best Lap", value: String(format: "%.2f", bestLap) + "s")
                            }
                            DetailRow(label: "Total Laps", value: String(session.totalLaps))
                        }
                        
                        Section(header: Text("Sync")) {
                            DetailRow(
                                label: "Status",
                                value: session.synced ? "Synced" : "Pending"
                            )
                            if let uploadedAt = session.uploadedAt {
                                DetailRow(label: "Uploaded", value: formatDate(uploadedAt))
                            }
                        }
                    }
                    .scrollContentBackground(.hidden)
                }
            }
            .navigationTitle("Session Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, h:mm a"
        return formatter.string(from: date)
    }
}

struct DetailRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.gray)
            Spacer()
            Text(value)
                .font(.system(.body, design: .monospaced))
                .foregroundColor(.white)
        }
    }
}

#Preview {
    SessionHistoryView()
        .environment(\.managedObjectContext, PersistenceManager.shared.viewContext)
}
