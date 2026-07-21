import SwiftUI

struct CoachRecommendationsView: View {
    @StateObject var coachService = CoachAIService()
    let liveSessionId: String
    
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                VStack(alignment: .leading) {
                    Text("COACH AI RECOMMENDATIONS")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text("\(coachService.recommendations.count) tips")
                        .font(.headline)
                        .foregroundColor(.white)
                }
                
                Spacer()
                
                if coachService.isLoadingRecommendations {
                    ProgressView()
                        .tint(Color(red: 0.84, green: 0.97, blue: 0.20))
                }
            }
            .padding(16)
            .background(Color(red: 0.08, green: 0.08, blue: 0.12))
            .border(Color(red: 0.15, green: 0.15, blue: 0.20), width: 1)
            
            if coachService.recommendations.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "lightbulb.slash")
                        .font(.system(size: 28))
                        .foregroundColor(.gray)
                    Text("No recommendations yet")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                .frame(maxHeight: .infinity)
                .padding(20)
            } else {
                ScrollView {
                    VStack(spacing: 8) {
                        ForEach(coachService.recommendations, id: \.type) { rec in
                            recommendationCard(rec)
                        }
                    }
                    .padding(12)
                }
            }
            
            if let error = coachService.error {
                HStack(spacing: 8) {
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
        .background(Color(red: 0.03, green: 0.03, blue: 0.05))
        .onAppear {
            coachService.startPolling(liveSessionId: liveSessionId, interval: 30)
        }
        .onDisappear {
            coachService.stopPolling()
        }
    }
    
    private func recommendationCard(_ rec: APIClient.CoachRecommendation) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                HStack(spacing: 4) {
                    Image(systemName: iconForType(rec.type))
                        .font(.caption)
                        .foregroundColor(priorityColor(rec.priority))
                    Text(rec.type)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                }
                
                Spacer()
                
                Text(rec.priority)
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(priorityColor(rec.priority))
                    .cornerRadius(3)
            }
            
            Text(rec.message)
                .font(.caption)
                .foregroundColor(.gray)
                .lineLimit(2)
            
            Text(rec.estimate)
                .font(.caption2)
                .foregroundColor(.gray)
                .italic()
            
            if rec.actionable {
                HStack(spacing: 4) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.caption2)
                    Text("Actionable")
                        .font(.caption2)
                }
                .foregroundColor(Color(red: 0.84, green: 0.97, blue: 0.20))
            }
        }
        .padding(10)
        .background(Color(red: 0.08, green: 0.08, blue: 0.12))
        .border(priorityColor(rec.priority).opacity(0.3), width: 1)
        .cornerRadius(6)
    }
    
    private func priorityColor(_ priority: String) -> Color {
        switch priority {
        case "CRITICAL":
            return Color.red
        case "HIGH":
            return Color(red: 1.0, green: 0.65, blue: 0.0)
        case "MEDIUM":
            return Color(red: 1.0, green: 0.84, blue: 0.0)
        case "LOW":
            return Color(red: 0.24, green: 0.51, blue: 0.98)
        default:
            return Color(red: 0.34, green: 0.98, blue: 0.22)
        }
    }
    
    private func iconForType(_ type: String) -> String {
        switch type {
        case "THROTTLE_MANAGEMENT":
            return "hand.raised"
        case "ENGINE_MANAGEMENT":
            return "thermometer"
        case "BRAKE_OPTIMIZATION":
            return "brake"
        case "CORNERING":
            return "arrow.triangle.2.circlepath"
        case "PACE_TREND":
            return "chart.line.uptrend.xyaxis"
        default:
            return "lightbulb"
        }
    }
}

#Preview {
    CoachRecommendationsView(liveSessionId: "test-session")
        .frame(height: 400)
}
