import Foundation
import UserNotifications

class NotificationManager: NSObject, ObservableObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationManager()
    
    @Published var isNotificationEnabled = false
    
    override init() {
        super.init()
        UNUserNotificationCenter.current().delegate = self
    }
    
    // MARK: - Request Permission
    
    func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            DispatchQueue.main.async {
                self.isNotificationEnabled = granted
                if let error = error {
                    print("[NotificationManager] Authorization error: \(error)")
                }
            }
        }
    }
    
    // MARK: - Send Notifications
    
    func sendCoachRecommendation(
        title: String,
        message: String,
        priority: String
    ) {
        guard isNotificationEnabled else { return }
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = message
        content.sound = .default
        content.badge = NSNumber(value: UIApplication.shared.applicationIconBadgeNumber + 1)
        
        // Add custom data
        content.userInfo = [
            "type": "coach_recommendation",
            "priority": priority
        ]
        
        // Set badge color based on priority
        switch priority {
        case "CRITICAL", "HIGH":
            content.sound = UNNotificationSound(named: UNNotificationSoundName(rawValue: "alert.caf"))
        default:
            break
        }
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[NotificationManager] Send error: \(error)")
            }
        }
    }
    
    func sendEngineAlarm(temperature: Double) {
        guard isNotificationEnabled else { return }
        
        let content = UNMutableNotificationContent()
        content.title = "Engine Temperature Alert"
        content.body = "Engine temp: \(Int(temperature))°C - Monitor radiator"
        content.sound = UNNotificationSound(named: UNNotificationSoundName(rawValue: "alert.caf"))
        content.badge = NSNumber(value: UIApplication.shared.applicationIconBadgeNumber + 1)
        
        content.userInfo = [
            "type": "engine_alert",
            "temperature": temperature
        ]
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[NotificationManager] Send error: \(error)")
            }
        }
    }
    
    func sendSessionCompleted(trackName: String, bestLap: Double) {
        guard isNotificationEnabled else { return }
        
        let content = UNMutableNotificationContent()
        content.title = "Session Completed"
        content.body = "\(trackName) - Best lap: \(String(format: "%.2f", bestLap))s"
        content.sound = .default
        content.badge = NSNumber(value: UIApplication.shared.applicationIconBadgeNumber + 1)
        
        content.userInfo = [
            "type": "session_completed",
            "trackName": trackName,
            "bestLap": bestLap
        ]
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[NotificationManager] Send error: \(error)")
            }
        }
    }
    
    func sendUploadSuccess() {
        guard isNotificationEnabled else { return }
        
        let content = UNMutableNotificationContent()
        content.title = "Session Synced"
        content.body = "Telemetry uploaded successfully"
        content.sound = .default
        
        content.userInfo = ["type": "upload_success"]
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[NotificationManager] Send error: \(error)")
            }
        }
    }
    
    // MARK: - UNUserNotificationCenterDelegate
    
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show notification even when app is in foreground
        completionHandler([.banner, .sound, .badge])
    }
    
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        
        if let type = userInfo["type"] as? String {
            print("[NotificationManager] Notification tapped - type: \(type)")
            // Handle notification tap - could navigate to specific screen
        }
        
        completionHandler()
    }
}
