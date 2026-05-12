import Foundation

struct StateEffect: Codable, Equatable {
    var sizeDelta: Double
    var distortionDelta: Double
    var calmnessDelta: Double
    var familiarityDelta: Double
    var uneaseDelta: Double
    var unlocksMemoryID: String?
    var unlocksRoomID: String?

    static let none = StateEffect(
        sizeDelta: 0,
        distortionDelta: 0,
        calmnessDelta: 0,
        familiarityDelta: 0,
        uneaseDelta: 0,
        unlocksMemoryID: nil,
        unlocksRoomID: nil
    )
}

