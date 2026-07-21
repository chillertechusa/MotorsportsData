import SwiftUI

@main
struct MotorsportsDataApp: App {
    @StateObject private var persistenceManager = PersistenceManager.shared
    
    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environment(\.managedObjectContext, persistenceManager.viewContext)
        }
    }
}
