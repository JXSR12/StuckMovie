import { Timestamp } from "firebase/firestore"
import { RequestStatus } from "../components/PendingTabs"

export class Request {
    id: string
    eid: string
    reason: string
    issued_date: Timestamp
    issuer_eid: string
    status: RequestStatus
    finalized_date: Timestamp
    finalizer_eid : string

    constructor(
        eid: string,
        reason: string,
        issued_date: Timestamp,
        issuer_eid: string,
        status: RequestStatus,
        finalized_date: Timestamp,
        finalizer_eid : string
    ) {
        this.eid = eid
        this.reason = reason
        this.issued_date = issued_date
        this.issuer_eid = issuer_eid
        this.status = status
        this.finalized_date = finalized_date
        this.finalizer_eid = finalizer_eid
    }
}