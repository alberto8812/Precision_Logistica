
export enum Status {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    DELIVERED = 'DELIVERED',

}

export interface SheudulingModel {
    id: string;
    driverName: string;
    plates: string;
    programingDate: string;
    status: Status;
}

export type CreateSheuduling = Omit<SheudulingModel, 'id'>;

export type UpdateSheuduling = Partial<CreateSheuduling>;