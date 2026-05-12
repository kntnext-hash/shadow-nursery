import Foundation

struct ShadowState: Codable, Equatable {
    var size: Double {
        didSet { size = Self.clamped(size) }
    }
    var distortion: Double {
        didSet { distortion = Self.clamped(distortion) }
    }
    var calmness: Double {
        didSet { calmness = Self.clamped(calmness) }
    }
    var familiarity: Double {
        didSet { familiarity = Self.clamped(familiarity) }
    }
    var unease: Double {
        didSet { unease = Self.clamped(unease) }
    }
    var stage: ShadowStage
    var memoryCount: Int
    var totalObservations: Int
    var lastObservedAt: Date
    var firstSeenAt: Date
    var totalMinutesObserved: Double

    init(
        size: Double,
        distortion: Double,
        calmness: Double,
        familiarity: Double,
        unease: Double,
        stage: ShadowStage,
        memoryCount: Int,
        totalObservations: Int,
        lastObservedAt: Date,
        firstSeenAt: Date,
        totalMinutesObserved: Double
    ) {
        self.size = Self.clamped(size)
        self.distortion = Self.clamped(distortion)
        self.calmness = Self.clamped(calmness)
        self.familiarity = Self.clamped(familiarity)
        self.unease = Self.clamped(unease)
        self.stage = stage
        self.memoryCount = memoryCount
        self.totalObservations = totalObservations
        self.lastObservedAt = lastObservedAt
        self.firstSeenAt = firstSeenAt
        self.totalMinutesObserved = totalMinutesObserved
    }

    private static func clamped(_ value: Double) -> Double {
        min(100, max(0, value))
    }
}

