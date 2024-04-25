export interface previous_round{
    _id?: number;
    year?: string;
    type?: string;
    size?: string;
    commited?: string;
    investors?: string;
    common_shares?: boolean;
    preferred_shares?: boolean;
    convertible_debt?: boolean;
    loan?: boolean;
    other?: boolean;
    business_angel?: boolean;
    accelerator_incubator?: boolean;
    vc_fund?: boolean;
    corporate?: boolean;
    public_grant?: boolean;
    crowd?: boolean;
}