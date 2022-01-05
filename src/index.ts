/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

import axios from 'axios';

const metaDataPath = 'data/meta.json';
const moodleEditPath =
    'https://aufgabenpool.f07-its.fh-koeln.de/moodle/question/question.php?&courseid=2&id=';

class Exercise {
    moodleID = 0;
    moodleCategory = '';
    title = '';
    tags: string[] = [];
    type = '';
    createHTMLElement(): HTMLElement {
        const element = document.createElement('div');
        // TODO;
        return element;
    }
}

export class Pool {
    private exercises: Exercise[] = [];
    private date = '';
    import(): void {
        const this_ = this;
        axios
            .get(metaDataPath)
            .then(function (response) {
                const data = response.data;
                this_.date = data['date'];
                for (const e of data['exercises']) {
                    const exercise = new Exercise();
                    this_.exercises.push(exercise);
                    exercise.moodleID = e['id'];
                    exercise.moodleCategory = e['category'];
                    exercise.tags = e['tags'];
                    exercise.type = e['type'];
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    }
}
