const { Todo } = require('../models');
const { TodoItem } = require('../models');

const checkActionPermission = (todo, req, res) => {
  if (!todo) {
    return res.status(404).send({ message: 'Not found' });
  }

  if (todo.userId !== req.decoded.id && !req.decoded.admin) {
    return res.status(403).send({ message: 'Forbidden' });
  }
};

module.exports = {
  create(req, res) {
    return Todo.create({
      title: req.body.title,
      userId: req.decoded.id,
    })
    .then(todo => res.status(201).send(todo), () => res.status(400).send({ message: 'Bad request' }));
  },
  list(req, res) {
    return Todo.findAll({
      where: {
        userId: req.decoded.id,
      },
      include: [{
        model: TodoItem,
        as: 'todoItems',
      }],
    }).then(todos =>
      todos ? res.status(200).send(todos) : res.status(404).send({ message: 'Not found' }),
      err => res.status(400).send(err)
    );
  },
  retrieve(req, res) {
    return Todo.findById(req.params.todoId, {
      include: [{
        model: TodoItem,
        as: 'todoItems',
      }],
    })
    .then(todo => {
      checkActionPermission(todo, req, res);
      return res.status(200).send(todo);
    }, () => res.status(400).send({ message: 'Bad request' }));
  },
  update(req, res) {
    return Todo.findById(req.params.todoId)
    .then(
      todo => {
        checkActionPermission(todo, req, res);
        return todo.update(req.body, { fields: Object.keys(req.body) })
        .then(() => res.status(200).send(todo), err => res.status(400).send(err));
      },
      err => res.status(400).send(err)
    );
  },
  destroy(req, res) {
    return Todo.findById(req.params.todoId)
    .then(
      todo => {
        checkActionPermission(todo, req, res);
        return todo.destroy().then(() => res.status(204).send(), err => res.status(400).send(err));
      },
      err => res.status(400).send(err)
    );
  },
};
