import Foundation
import CoreData

class PersistenceManager {
    static let shared = PersistenceManager()
    
    let container: NSPersistentContainer
    
    init() {
        container = NSPersistentContainer(name: "MotorsportsData")
        
        let storeDescription = container.persistentStoreDescriptions.first
        storeDescription?.setOption(true as NSNumber, forKey: NSMigratePersistentStoresAutomaticallyOption)
        storeDescription?.setOption(true as NSNumber, forKey: NSInferMappingModelAutomaticallyOption)
        
        container.loadPersistentStores { description, error in
            if let error = error {
                fatalError("Unable to load persistent stores: \(error)")
            }
        }
        
        container.viewContext.automaticallyMergesChangesFromParent = true
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
    }
    
    var viewContext: NSManagedObjectContext {
        container.viewContext
    }
    
    func saveContext() {
        let context = viewContext
        
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                let nsError = error as NSError
                print("[PersistenceManager] Save error: \(nsError.localizedDescription)")
            }
        }
    }
    
    // MARK: - Session Operations
    
    func createSession(
        riderEmail: String,
        vehicleId: String,
        trackName: String,
        discipline: String,
        conditions: String? = nil,
        temperature: Int? = nil
    ) -> CDRacingSession {
        let session = CDRacingSession(context: viewContext)
        session.id = UUID().uuidString
        session.riderEmail = riderEmail
        session.vehicleId = vehicleId
        session.trackName = trackName
        session.sessionDate = Date()
        session.discipline = discipline
        session.conditions = conditions
        session.temperature = temperature as NSNumber?
        session.synced = false
        session.totalLaps = 0
        session.createdAt = Date()
        session.updatedAt = Date()
        
        saveContext()
        return session
    }
    
    func fetchSessions() -> [CDRacingSession] {
        let fetchRequest: NSFetchRequest<CDRacingSession> = CDRacingSession.fetchRequest()
        fetchRequest.sortDescriptors = [NSSortDescriptor(keyPath: \CDRacingSession.sessionDate, ascending: false)]
        
        do {
            return try viewContext.fetch(fetchRequest)
        } catch {
            print("[PersistenceManager] Fetch sessions error: \(error)")
            return []
        }
    }
    
    func fetchSession(by id: String) -> CDRacingSession? {
        let fetchRequest: NSFetchRequest<CDRacingSession> = CDRacingSession.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@", id)
        
        do {
            return try viewContext.fetch(fetchRequest).first
        } catch {
            print("[PersistenceManager] Fetch session error: \(error)")
            return nil
        }
    }
    
    func deleteSession(_ session: CDRacingSession) {
        viewContext.delete(session)
        saveContext()
    }
    
    // MARK: - Telemetry Operations
    
    func addTelemetryPoint(
        to session: CDRacingSession,
        timestamp: TimeInterval,
        lapNumber: Int,
        speed: Double,
        throttle: Double,
        brakePressure: Double? = nil,
        engineTempC: Double? = nil,
        gLateral: Double? = nil,
        gLongitudinal: Double? = nil,
        gpsLat: Double? = nil,
        gpsLon: Double? = nil
    ) -> CDTelemetryPoint {
        let point = CDTelemetryPoint(context: viewContext)
        point.timestamp = timestamp
        point.lapNumber = Int32(lapNumber)
        point.speed = speed
        point.throttle = throttle
        point.brakePressure = brakePressure as NSNumber?
        point.engineTempC = engineTempC as NSNumber?
        point.gLateral = gLateral as NSNumber?
        point.gLongitudinal = gLongitudinal as NSNumber?
        point.gpsLat = gpsLat as NSNumber?
        point.gpsLon = gpsLon as NSNumber?
        point.deviceTimestamp = Int64(timestamp * 1000)
        point.racingSession = session
        point.createdAt = Date()
        
        session.totalLaps = max(session.totalLaps, Int32(lapNumber))
        session.updatedAt = Date()
        
        saveContext()
        return point
    }
    
    func fetchTelemetryPoints(for session: CDRacingSession) -> [CDTelemetryPoint] {
        let fetchRequest: NSFetchRequest<CDTelemetryPoint> = CDTelemetryPoint.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "racingSession == %@", session)
        fetchRequest.sortDescriptors = [NSSortDescriptor(keyPath: \CDTelemetryPoint.timestamp, ascending: true)]
        
        do {
            return try viewContext.fetch(fetchRequest)
        } catch {
            print("[PersistenceManager] Fetch telemetry error: \(error)")
            return []
        }
    }
    
    // MARK: - Upload Queue Operations
    
    func addToUploadQueue(sessionId: String) -> CDUploadQueue {
        let item = CDUploadQueue(context: viewContext)
        item.id = UUID().uuidString
        item.sessionId = sessionId
        item.status = "pending"
        item.attempts = 0
        item.createdAt = Date()
        item.updatedAt = Date()
        
        saveContext()
        return item
    }
    
    func fetchPendingUploads() -> [CDUploadQueue] {
        let fetchRequest: NSFetchRequest<CDUploadQueue> = CDUploadQueue.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "status == %@", "pending")
        fetchRequest.sortDescriptors = [NSSortDescriptor(keyPath: \CDUploadQueue.createdAt, ascending: true)]
        
        do {
            return try viewContext.fetch(fetchRequest)
        } catch {
            print("[PersistenceManager] Fetch upload queue error: \(error)")
            return []
        }
    }
    
    func updateUploadStatus(_ item: CDUploadQueue, status: String, attempts: Int? = nil) {
        item.status = status
        if let attempts = attempts {
            item.attempts = Int32(attempts)
        }
        item.lastAttemptAt = Date()
        item.updatedAt = Date()
        
        saveContext()
    }
}
