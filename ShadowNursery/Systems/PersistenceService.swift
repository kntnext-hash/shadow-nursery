import CoreData
import Foundation

protocol PersistenceService {
    func save(_ state: GameState) throws
    func load() throws -> GameState
    func reset() throws
}

enum PersistenceServiceError: Error {
    case storeUnavailable
    case missingPayload
}

final class CoreDataPersistenceService: PersistenceService {
    static let shared = CoreDataPersistenceService()

    private let container: NSPersistentContainer
    private let saveID = "primary"

    init(inMemory: Bool = false) {
        let model = Self.makeModel()
        container = NSPersistentContainer(name: "ShadowNursery", managedObjectModel: model)

        if inMemory {
            let description = NSPersistentStoreDescription()
            description.type = NSInMemoryStoreType
            container.persistentStoreDescriptions = [description]
        }

        container.loadPersistentStores { _, error in
            if let error {
                assertionFailure("CoreData store failed to load: \(error.localizedDescription)")
            }
        }
    }

    func save(_ state: GameState) throws {
        let context = container.viewContext
        let object = try existingObject(in: context) ?? NSManagedObject(entity: try savedGameEntity(in: context), insertInto: context)
        object.setValue(saveID, forKey: "id")
        object.setValue(try JSONEncoder().encode(state), forKey: "payload")
        object.setValue(Date(), forKey: "updatedAt")

        if context.hasChanges {
            try context.save()
        }
    }

    func load() throws -> GameState {
        let context = container.viewContext

        guard let object = try existingObject(in: context) else {
            return DefaultGameState.make()
        }

        guard let payload = object.value(forKey: "payload") as? Data else {
            throw PersistenceServiceError.missingPayload
        }

        return try JSONDecoder().decode(GameState.self, from: payload)
    }

    func reset() throws {
        let context = container.viewContext
        if let object = try existingObject(in: context) {
            context.delete(object)
        }

        if context.hasChanges {
            try context.save()
        }
    }

    private func existingObject(in context: NSManagedObjectContext) throws -> NSManagedObject? {
        let request = NSFetchRequest<NSManagedObject>(entityName: "SavedGame")
        request.fetchLimit = 1
        request.predicate = NSPredicate(format: "id == %@", saveID)
        return try context.fetch(request).first
    }

    private func savedGameEntity(in context: NSManagedObjectContext) throws -> NSEntityDescription {
        guard let entity = NSEntityDescription.entity(forEntityName: "SavedGame", in: context) else {
            throw PersistenceServiceError.storeUnavailable
        }
        return entity
    }

    private static func makeModel() -> NSManagedObjectModel {
        let model = NSManagedObjectModel()

        let entity = NSEntityDescription()
        entity.name = "SavedGame"
        entity.managedObjectClassName = NSStringFromClass(NSManagedObject.self)

        let id = NSAttributeDescription()
        id.name = "id"
        id.attributeType = .stringAttributeType
        id.isOptional = false

        let payload = NSAttributeDescription()
        payload.name = "payload"
        payload.attributeType = .binaryDataAttributeType
        payload.isOptional = false

        let updatedAt = NSAttributeDescription()
        updatedAt.name = "updatedAt"
        updatedAt.attributeType = .dateAttributeType
        updatedAt.isOptional = false

        entity.properties = [id, payload, updatedAt]
        model.entities = [entity]

        return model
    }
}

