import SwiftUI

@main
struct ShadowNurseryApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup {
            RoomView()
        }
    }
}

