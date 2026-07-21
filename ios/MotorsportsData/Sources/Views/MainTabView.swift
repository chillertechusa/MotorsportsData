import SwiftUI

struct MainTabView: View {
    @StateObject var notificationManager = NotificationManager.shared
    @State var selectedTab = 0
    
    var body: some View {
        ZStack {
            Color(red: 0.03, green: 0.03, blue: 0.05).ignoresSafeArea()
            
            TabView(selection: $selectedTab) {
                // Log Session Tab
                SessionView()
                    .tabItem {
                        Label("Log", systemImage: "pencil.circle.fill")
                    }
                    .tag(0)
                
                // History Tab
                SessionHistoryView()
                    .tabItem {
                        Label("History", systemImage: "list.bullet.circle.fill")
                    }
                    .tag(1)
                
                // Settings Tab
                SettingsView()
                    .tabItem {
                        Label("Settings", systemImage: "gear.circle.fill")
                    }
                    .tag(2)
            }
            .tint(Color(red: 0.84, green: 0.97, blue: 0.20))
        }
        .onAppear {
            notificationManager.requestNotificationPermission()
            setupAppearance()
        }
    }
    
    private func setupAppearance() {
        // Configure tab bar appearance
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        tabBarAppearance.backgroundColor = UIColor(red: 0.08, green: 0.08, blue: 0.12, alpha: 1.0)
        
        UITabBar.appearance().standardAppearance = tabBarAppearance
        if #available(iOS 15.0, *) {
            UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
        }
        
        // Configure navigation bar appearance
        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithOpaqueBackground()
        navAppearance.backgroundColor = UIColor(red: 0.08, green: 0.08, blue: 0.12, alpha: 1.0)
        navAppearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        
        UINavigationBar.appearance().standardAppearance = navAppearance
        if #available(iOS 15.0, *) {
            UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
        }
    }
}

struct SettingsView: View {
    @StateObject var notificationManager = NotificationManager.shared
    @State var riderEmail = UserDefaults.standard.string(forKey: "riderEmail") ?? ""
    @State var vehicleId = UserDefaults.standard.string(forKey: "vehicleId") ?? ""
    @State var showSaveAlert = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 0.03, green: 0.03, blue: 0.05).ignoresSafeArea()
                
                VStack(spacing: 0) {
                    Form {
                        Section(header: Text("Rider Profile")) {
                            TextField("Email", text: $riderEmail)
                                .keyboardType(.emailAddress)
                            TextField("Vehicle ID", text: $vehicleId)
                        }
                        
                        Section(header: Text("Notifications")) {
                            Toggle(
                                "Enable Push Notifications",
                                isOn: $notificationManager.isNotificationEnabled
                            )
                            .onChange(of: notificationManager.isNotificationEnabled) { newValue in
                                if newValue {
                                    notificationManager.requestNotificationPermission()
                                }
                            }
                        }
                        
                        Section(header: Text("About")) {
                            HStack {
                                Text("Version")
                                Spacer()
                                Text("1.0.0")
                                    .foregroundColor(.gray)
                            }
                            HStack {
                                Text("App Name")
                                Spacer()
                                Text("Motorsports Data")
                                    .foregroundColor(.gray)
                            }
                        }
                        
                        Section {
                            Button(action: saveSettings) {
                                HStack {
                                    Spacer()
                                    Text("Save Settings")
                                        .font(.headline)
                                        .foregroundColor(.black)
                                    Spacer()
                                }
                                .padding(12)
                                .background(Color(red: 0.84, green: 0.97, blue: 0.20))
                                .cornerRadius(8)
                            }
                        }
                    }
                    .scrollContentBackground(.hidden)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .alert("Settings Saved", isPresented: $showSaveAlert) {
                Button("OK") { }
            } message: {
                Text("Your settings have been saved.")
            }
        }
    }
    
    private func saveSettings() {
        UserDefaults.standard.set(riderEmail, forKey: "riderEmail")
        UserDefaults.standard.set(vehicleId, forKey: "vehicleId")
        showSaveAlert = true
    }
}

#Preview {
    MainTabView()
}
