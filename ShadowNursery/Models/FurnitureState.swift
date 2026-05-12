import Foundation

struct FurnitureState: Codable, Identifiable, Equatable {
    let id: FurnitureID
    var position: FurniturePosition
    var isPresent: Bool
}

enum FurnitureID: String, Codable, CaseIterable {
    case chair
    case table
    case lamp
    case bookshelf
    case curtain
    case mirrorFragment
}

enum FurniturePosition: String, Codable, CaseIterable {
    case nearCorner
    case center
    case againstWall
    case removed
}

