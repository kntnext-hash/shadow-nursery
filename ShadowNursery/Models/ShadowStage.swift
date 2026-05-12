import Foundation

enum ShadowStage: Int, Codable, CaseIterable {
    case dormant = 0
    case aware = 1
    case present = 2
    case familiar = 3
    case watching = 4
    case unknown = 5
}

