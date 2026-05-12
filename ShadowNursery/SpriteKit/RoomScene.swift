import SpriteKit

final class RoomScene: SKScene {
    private let wallNode = SKShapeNode()
    private let floorNode = SKShapeNode()
    private let cornerLineNode = SKShapeNode()
    private let shadowNode = SKShapeNode(ellipseOf: CGSize(width: 92, height: 34))

    override func didMove(to view: SKView) {
        backgroundColor = SKColor(red: 0.10, green: 0.09, blue: 0.08, alpha: 1.0)
        configureStaticNodes()
        layoutRoom()
    }

    override func didChangeSize(_ oldSize: CGSize) {
        layoutRoom()
    }

    private func configureStaticNodes() {
        if wallNode.parent == nil {
            wallNode.fillColor = SKColor(red: 0.23, green: 0.20, blue: 0.17, alpha: 1.0)
            wallNode.strokeColor = .clear
            addChild(wallNode)
        }

        if floorNode.parent == nil {
            floorNode.fillColor = SKColor(red: 0.15, green: 0.13, blue: 0.11, alpha: 1.0)
            floorNode.strokeColor = .clear
            addChild(floorNode)
        }

        if cornerLineNode.parent == nil {
            cornerLineNode.strokeColor = SKColor(red: 0.08, green: 0.07, blue: 0.06, alpha: 0.55)
            cornerLineNode.lineWidth = 2
            addChild(cornerLineNode)
        }

        if shadowNode.parent == nil {
            shadowNode.fillColor = SKColor.black.withAlphaComponent(0.78)
            shadowNode.strokeColor = .clear
            shadowNode.zPosition = 10
            addChild(shadowNode)
        }
    }

    private func layoutRoom() {
        guard size.width > 0, size.height > 0 else { return }

        let wallHeight = size.height * 0.62
        let floorHeight = size.height - wallHeight

        wallNode.path = CGPath(
            rect: CGRect(x: 0, y: floorHeight, width: size.width, height: wallHeight),
            transform: nil
        )

        floorNode.path = CGPath(
            rect: CGRect(x: 0, y: 0, width: size.width, height: floorHeight),
            transform: nil
        )

        let cornerPath = CGMutablePath()
        cornerPath.move(to: CGPoint(x: 0, y: floorHeight))
        cornerPath.addLine(to: CGPoint(x: size.width, y: floorHeight))
        cornerLineNode.path = cornerPath

        shadowNode.position = CGPoint(x: size.width * 0.22, y: floorHeight + 12)
        shadowNode.xScale = max(0.8, size.width / 430)
        shadowNode.yScale = max(0.8, size.height / 932)
    }
}

