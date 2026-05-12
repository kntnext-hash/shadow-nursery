import Combine
import Foundation

@MainActor
final class GameViewModel: ObservableObject {
    @Published private(set) var gameState: GameState

    private let persistence: PersistenceService

    init(persistence: PersistenceService = CoreDataPersistenceService.shared) {
        self.persistence = persistence
        self.gameState = (try? persistence.load()) ?? DefaultGameState.make()
    }

    func save() {
        do {
            try persistence.save(gameState)
        } catch {
            assertionFailure("Failed to save game state: \(error.localizedDescription)")
        }
    }
}
