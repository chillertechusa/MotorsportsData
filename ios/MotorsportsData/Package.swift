// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "MotorsportsData",
    defaultLocalization: "en",
    platforms: [
        .iOS(.v14)
    ],
    products: [
        .library(
            name: "MotorsportsData",
            targets: ["MotorsportsData"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "MotorsportsData",
            dependencies: [],
            path: "Sources"
        )
    ]
)
