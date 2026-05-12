import Foundation

struct MemoryFragment: Codable, Identifiable, Equatable {
    let id: String
    let text: String
    let unlockCondition: MemoryCondition
    var isUnlocked: Bool
    var unlockedAt: Date?
}

struct MemoryCondition: Codable, Equatable {
    let key: String
    let detail: String
}

