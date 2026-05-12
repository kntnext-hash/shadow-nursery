import SpriteKit
import SwiftUI

struct RoomView: View {
    @StateObject private var viewModel = GameViewModel()

    var body: some View {
        SpriteView(scene: makeScene())
            .ignoresSafeArea()
            .background(Color.black)
            .onAppear {
                viewModel.save()
            }
    }

    private func makeScene() -> SKScene {
        let scene = RoomScene()
        scene.scaleMode = .resizeFill
        return scene
    }
}

#Preview {
    RoomView()
}

