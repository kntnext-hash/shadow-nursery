import Foundation

struct RoomState: Codable, Identifiable, Equatable {
    let id: RoomID
    var isUnlocked: Bool
    var unlockedAt: Date?
    var lightAngle: Double {
        didSet { lightAngle = Self.clamped(lightAngle) }
    }
    var lightIntensity: Double {
        didSet { lightIntensity = Self.clamped(lightIntensity) }
    }
    var ambientMood: AmbientMood

    init(
        id: RoomID,
        isUnlocked: Bool,
        unlockedAt: Date?,
        lightAngle: Double,
        lightIntensity: Double,
        ambientMood: AmbientMood
    ) {
        self.id = id
        self.isUnlocked = isUnlocked
        self.unlockedAt = unlockedAt
        self.lightAngle = Self.clamped(lightAngle)
        self.lightIntensity = Self.clamped(lightIntensity)
        self.ambientMood = ambientMood
    }

    private static func clamped(_ value: Double) -> Double {
        min(100, max(0, value))
    }
}

enum RoomID: String, Codable, CaseIterable {
    case mainRoom
    case hallway
    case childRoom
    case emptyRoom
}

enum AmbientMood: String, Codable, CaseIterable {
    case warm
    case dim
    case cold
    case dark
}

