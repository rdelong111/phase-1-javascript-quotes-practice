document.addEventListener('DOMContentLoaded', () => {
	// adding all the existing quotes
	getQuotes();
	// adding a hidden editfield
	editfield();
	// adding a sort-by-author button
	createsortbtn();

	// if the sort button is clicked
	const sortbtn = document.getElementById('sort');
	const quotelist = document.getElementById('quote-list');

	sortbtn.addEventListener('click', () => {
		if (sortbtn.textContent === 'Sort by Author') {
			quotelist.innerHTML = '';
			sortbtn.textContent = 'UNSORT';
			getQuotes();
		}
		else {
			quotelist.innerHTML = '';
			sortbtn.textContent = 'Sort by Author';
			getQuotes();
		}
	});

	// for when a new quote is submitted
	const newquoteform = document.querySelector('form#new-quote-form');
	newquoteform.addEventListener('submit', (e) => {
		e.preventDefault();
		newQuote();
		newquoteform.reset();
	});

	// for when a quote edit is submitted
	const editquoteform = document.querySelector('form#edit-quote-info');
	editquoteform.addEventListener('submit', (e) => {
		e.preventDefault();
		editquote();
		editquoteform.reset();
	});
});

// initial fetch on page load
function getQuotes() {
	fetch('http://localhost:3000/quotes?_embed=likes')
	.then((r) => r.json())
	.then((quotes) => {
		if (!(document.getElementById('sort').textContent === 'Sort by Author')) {
			quotes.sort((x, y) => x.author.localeCompare(y.author))
		}

		for (quote of quotes) {
			addQuote(quote);
		}
	});
}

// adding a quote to the DOM
function addQuote(quote) {
	const quotelist = document.getElementById('quote-list');
	const quotecard = document.createElement('li');
	const blkquote = document.createElement('blockquote');
	const thequote = document.createElement('p');
	const author = document.createElement('footer');
	const linebrk = document.createElement('br');
	const likebtn = document.createElement('button');
	const likeamt = document.createElement('span');
	const deletebtn = document.createElement('button');
	const editbtn = document.createElement('button');

	quotecard.setAttribute('class', 'quote-card');
	quotecard.classList.add(quote.id);
	blkquote.setAttribute('class', 'blockquote');
	thequote.setAttribute('class', 'mb-0');
	thequote.textContent = quote.quote;
	author.setAttribute('class', 'blockquote-footer');
	author.textContent = quote.author;
	likebtn.setAttribute('class', 'btn-success');
	likebtn.textContent = 'Likes: ';
	likeamt.textContent = quote.likes.length;
	deletebtn.setAttribute('class', 'btn-danger');
	deletebtn.textContent = 'Delete';
	editbtn.textContent = 'EDIT';

	likebtn.appendChild(likeamt);
	blkquote.appendChild(thequote);
	blkquote.appendChild(author);
	blkquote.appendChild(linebrk);
	blkquote.appendChild(likebtn);
	blkquote.appendChild(deletebtn);
	blkquote.appendChild(editbtn);
	quotecard.appendChild(blkquote);
	quotelist.appendChild(quotecard);

	// deleting a quote
	deletebtn.addEventListener('click', () => {
		deletequote(quote.id, quotecard);
	});

	// liking a quote
	likebtn.addEventListener('click', () => {
		likequote(quote.id, likeamt);
	});

	// editing a quote
	editbtn.addEventListener('click', () => {
		const subbtn = document.getElementById('EQbutton');
		const allbtns = document.querySelectorAll('button');

		// disable all buttons except the edit-submit button
		for (singlebtn of allbtns) {
			singlebtn.disabled = true;
		}
		subbtn.disabled = false;

		document.querySelector('form#edit-quote-info').style.display = 'block';
		subbtn.id = quote.id;

		// getting the most updated quote
		fetch(`http://localhost:3000/quotes/${quote.id}`)
		.then((r) => r.json())
		.then((object) => {
			document.getElementById('edit-quote').value = object.quote;
			document.getElementById('edit-author').value = object.author;
		})
	});
}

function newQuote() {
	const Nquote = document.getElementById('new-quote').value;
	const Nauthor = document.getElementById('author').value;

	fetch('http://localhost:3000/quotes', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify({
			quote: Nquote,
			author: Nauthor
		})
	})
	.then((r) => r.json())
	.then((object) => {
		// if the sort button is on
		if (document.getElementById('sort').textContent === 'UNSORT') {
			document.getElementById('quote-list').innerHTML = '';
			getQuotes();
		}
		else {
			object.likes = []; // every new quote starts with 0 likes
			addQuote(object);
		}
	})
}

function deletequote(ID, quotecard) {
	fetch(`http://localhost:3000/quotes/${ID}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(quotecard.remove());
}

function likequote(ID, amt) {
	fetch('http://localhost:3000/likes', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify({
			quoteId: ID,
			createdAt: Date.now()
		})
	})
	.then(getupdatedlikes(ID, amt));
}

// gets the most updated likes and adds it to the DOM
function getupdatedlikes(ID, amt) {
	fetch(`http://localhost:3000/likes?quoteId=${ID}`)
	.then((r) => r.json())
	.then((likes) => {
		amt.textContent = likes.length;
	})
}

// the initially hidden edit field
function editfield() {
	const thebody = document.querySelector('body');
	const editform = document.createElement('form');
	const editQlabel = document.createElement('label');
	const editQinput = document.createElement('input');
	const editAlabel = document.createElement('label');
	const editAinput = document.createElement('input');
	const btn = document.createElement('button');
	const break1 = document.createElement('br');
	const break2 = document.createElement('br');
	const pagebreak = document.createElement('hr');

	editform.setAttribute('id', 'edit-quote-info');
	editform.style.display = 'none';
	editQlabel.setAttribute('for', 'edit-quote');
	editQlabel.textContent = 'Edit Quote';
	editQinput.setAttribute('type', 'text');
	editQinput.setAttribute('id', 'edit-quote');
	editQinput.style.width = '100%';
	editAlabel.setAttribute('for', 'edit-author');
	editAlabel.textContent = 'Edit Author';
	editAinput.setAttribute('type', 'text');
	editAinput.setAttribute('id', 'edit-author');
	editAinput.style.width = '100%';
	btn.setAttribute('id', 'EQbutton');
	btn.textContent = 'Submit Edit';

	editform.appendChild(editQlabel);
	editform.appendChild(editQinput);
	editform.appendChild(break1)
	editform.appendChild(editAlabel);
	editform.appendChild(editAinput);
	editform.appendChild(break2);
	editform.appendChild(btn);
	thebody.appendChild(pagebreak);
	thebody.appendChild(editform);
}

// when the edit field submit button is clicked
function editquote() {
	const editedQ = document.getElementById('edit-quote').value;
	const editedA = document.getElementById('edit-author').value;
	const btn = document.querySelector('#edit-quote-info button');
	const thequote = document.getElementsByClassName(btn.id)[0].querySelector('blockquote p');
	const theauthor = document.getElementsByClassName(btn.id)[0].querySelector('blockquote footer');
	const allbtns = document.querySelectorAll('button');

	fetch(`http://localhost:3000/quotes/${btn.id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			quote: editedQ,
			author: editedA
		})
	})
	.then((r) => r.json())
	.then((object) => {
		// if the sort button is on
		if (document.getElementById('sort').textContent === 'UNSORT') {
			document.getElementById('quote-list').innerHTML = '';
			getQuotes();
		}
		else {
			thequote.textContent = object.quote;
			theauthor.textContent = object.author;
		}
		
		document.querySelector('form#edit-quote-info').style.display = 'none';
		// the edit submit button is given its original id
		btn.id = 'EQbutton';
		// re-enable all buttons
		for (singlebtn of allbtns) {
			singlebtn.disabled = false;
		}
	})
}

function createsortbtn() {
	const title = document.querySelector('h1');
	const btn = document.createElement('button');
	btn.setAttribute('id', 'sort');
	btn.textContent = 'Sort by Author';
	title.after(btn);
}