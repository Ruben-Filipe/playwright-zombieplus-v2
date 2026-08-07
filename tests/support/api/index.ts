import { APIRequestContext, expect } from '@playwright/test';

export interface MovieData {
    title: string;
    overview: string;
    company: string;
    releaseYear: number;
    featured?: boolean;
    cover?: string;
}

export interface TvshowData {
    title: string;
    overview: string;
    company: string;
    releaseYear: number;
    seasons: number;
    featured?: boolean;
    cover?: string;
}

export class Api {
    private token: string;

    constructor(private readonly request: APIRequestContext) {
        this.token = '';
    }

    async setToken(): Promise<void> {
        const response = await this.request.post('/sessions', {
            data: { email: 'admin@zombieplus.com', password: 'pwd123' }
        });

        expect(response.ok()).toBeTruthy();

        const responseBody = await response.json();
        const token = (responseBody as { token?: string })?.token;

        if (!token) {
            throw new Error('Unable to retrieve authentication token from /sessions response.');
        }

        this.token = `Bearer ${token}`;
    }

    async createLead(name: string, email: string): Promise<void> {
        const response = await this.request.post('/leads', {
            data: { name, email }
        });

        expect(response.ok()).toBeTruthy();
    }

    async createMovie(movie: MovieData): Promise<void> {
        const companyId = await this.getCompanyIdByName(movie.company);

        const response = await this.request.post('/movies', {
            headers: {
                Authorization: this.token,
                ContentType: 'multipart/form-data',
                Accept: 'application/json, text/plain */*'
            },
            multipart: {
                title: movie.title,
                overview: movie.overview,
                company_id: companyId,
                release_year: movie.releaseYear,
                featured: movie.featured || false
            }
        });

        expect(response.ok()).toBeTruthy();
    }

    async createTvshow(tvshow: TvshowData): Promise<void> {
        const companyId = await this.getCompanyIdByName(tvshow.company);

        const response = await this.request.post('/tvshows', {
            headers: {
                Authorization: this.token,
                ContentType: 'multipart/form-data',
                Accept: 'application/json, text/plain */*'
            },
            multipart: {
                title: tvshow.title,
                overview: tvshow.overview,
                company_id: companyId,
                release_year: tvshow.releaseYear,
                seasons: tvshow.seasons,
                featured: tvshow.featured || false
            }
        });

        expect(response.ok()).toBeTruthy();
    }

    async getCompanyIdByName(name: string): Promise<string | null> {
        const response = await this.request.get('/companies', {
            params: { name },
            headers: this.token ? { Authorization: this.token } : undefined
        });

        expect(response.ok()).toBeTruthy();

        const body = await response.json();
        const first = body && Array.isArray(body.data) && body.data[0];
        return first && first.id ? first.id : null;
    }
}
