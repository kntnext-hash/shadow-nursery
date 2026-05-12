import Foundation

struct ShadowPrompt: Codable, Identifiable, Equatable {
    let id: String
    let text: String
    let choices: [PromptChoice]
    let condition: PromptCondition
    var hasBeenShown: Bool
    var shownAt: Date?
}

struct PromptChoice: Codable, Equatable {
    let label: String
    let effect: StateEffect
}

struct PromptCondition: Codable, Equatable {
    let key: String
    let detail: String
}

