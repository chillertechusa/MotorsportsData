import Foundation

class CoachAIService: ObservableObject {
    @Published var recommendations: [APIClient.CoachRecommendation] = []
    @Published var isLoadingRecommendations = false
    @Published var error: String?
    
    private let apiClient = APIClient.shared
    private var pollingTimer: Timer?
    
    func startPolling(liveSessionId: String, interval: TimeInterval = 30) {
        stopPolling()
        
        pollingTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            self?.fetchRecommendations(for: liveSessionId)
        }
        
        // Fetch immediately
        fetchRecommendations(for: liveSessionId)
    }
    
    func stopPolling() {
        pollingTimer?.invalidate()
        pollingTimer = nil
    }
    
    func fetchRecommendations(for liveSessionId: String) {
        guard !isLoadingRecommendations else { return }
        
        isLoadingRecommendations = true
        
        Task {
            do {
                let response = try await apiClient.getCoachRecommendations(
                    liveSessionId: liveSessionId,
                    lastN: 50
                )
                
                DispatchQueue.main.async {
                    self.recommendations = response.recommendations
                    self.isLoadingRecommendations = false
                    self.error = nil
                }
            } catch {
                DispatchQueue.main.async {
                    self.error = error.localizedDescription
                    self.isLoadingRecommendations = false
                }
            }
        }
    }
    
    deinit {
        stopPolling()
    }
}
