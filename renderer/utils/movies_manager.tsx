import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { database } from '../database/firebase';

import { Genre, getAllGenres, getGenre } from './genre_manager';
import { AgeRating, getAgeRating, getAllAgeRatings } from './agerating_manager';
import { getAllProducers, getProducer, Producer } from './producers_manager';
import { faker } from '@faker-js/faker';

const db_movies = collection(database, 'movies');

export class Movie {
    id: string
    title: string
    synopsis: string
    durationMinutes: number
    genres: Genre[]
    ageRating: AgeRating
    producer: Producer
    poster_url: string

    constructor(
        id: string,
        title: string,
        synopsis: string,
        durationMinutes: number,
        genres: Genre[],
        ageRating: AgeRating,
        producer: Producer,
        poster_url: string
    ) {
        this.id = id
        this.title = title
        this.synopsis = synopsis
        this.durationMinutes = durationMinutes
        this.genres = genres
        this.ageRating = ageRating
        this.producer = producer
        this.poster_url = poster_url
    }

    insert() {
        const q = addDoc(db_movies, {
            title: this.title,
            synopsis: this.synopsis,
            durationminutes: this.durationMinutes,
            genre_ids: this.genres.map(g => g.id),
            agerating_id: this.ageRating.id,
            producer_id: this.producer.id,
            poster_url: this.poster_url
        });
        return q;
    }

    static async seedMovies() {
        getAllGenres().then(gs => {
            getAllAgeRatings().then(ag => {
                getAllProducers().then(pr => {
                    const genres : Genre[] = [];
                    const ageratings : AgeRating[] = [];
                    const producers : Producer[] = [];

                    gs.docs.map((gsi) => {
                        genres.push({id: gsi.id, ...gsi.data()} as Genre);
                    })
                    ag.docs.map((agi) => {
                        ageratings.push({id: agi.id, ...agi.data()} as AgeRating);
                    })
                    pr.docs.map((pri) => {
                        producers.push({id: pri.id, ...pri.data()} as Producer);
                    })

                    for(let i = 0; i < 75; i++){
                        var rand = Math.floor(Math.random() * 3);
                        var mv = new Movie("BLANK", rand % 3 === 0 ? (faker.word.preposition() + ' ' + faker.word.adjective() + ' ' + faker.word.noun()) : rand % 3 === 1 ? (faker.word.verb()) : (faker.word.adverb() + ' ' + faker.word.verb() + ' ' + faker.word.noun()), faker.lorem.sentences(8), Math.floor(Math.random() * 241), [], ageratings[Math.floor(Math.random() * ageratings.length)], producers[Math.floor(Math.random() * producers.length)], "https://picsum.photos/300/400")

                        var gc = Math.floor(Math.random() * 4) + 1;

                        for(let j = 0; j < gc; j++){
                            var genre = genres[Math.floor(Math.random() * genres.length)];
                            while(mv.genres.includes(genre)){
                                genre = genres[Math.floor(Math.random() * genres.length)];
                            }
                            mv.genres.push(genre);
                        }

                        mv.title = mv.title.replace(/\w+/g,
                        function(w){return w[0].toUpperCase() + w.slice(1).toLowerCase();});

                        mv.insert();
                    }

                })
            })
        })
    }
}

export async function insertNewMovie(
    title: string,
    synopsis: string,
    durationMinutes: number,
    genres: Genre[],
    ageRating: AgeRating,
    producer: Producer,
    poster_url: string
    ){
    const mv : Movie = new Movie("", title, synopsis, durationMinutes, genres, ageRating, producer, poster_url);
    mv.insert();
}

export async function getMovie(id: string) {
    const docRef = doc(database, 'movies', id);
    const promise = await getDoc(docRef);

    return promise;
}


export async function getAllMovies() {
    const promise = await getDocs(db_movies);

    return promise;
}

export async function getAllMoviesRTU(){
    var movies : Movie[] = [];

    await getAllMovies().then((data) => {
        data.docs.map((doc) => {
            getProducer(doc.data().producer_id).then(p => {
              const pro = {id: p.id, ...p.data()} as Producer;
              getAgeRating(doc.data().agerating_id).then(ag => {
                const ager = {id: ag.id, ...ag.data()} as AgeRating;
                const genres : Genre[] = [];
                doc.data().genre_ids.map(gid => {
                  getGenre(gid).then(ge => {
                    const genre = {id: ge.id, ...ge.data()} as Genre;
                    genres.push(genre);
                  })
                })

                const mov = {id: doc.id, ...doc.data(), genres: genres, ageRating: ager, producer: pro} as Movie;
                movies.push(mov);
              })
            })
          })
    });

    return await movies;
}