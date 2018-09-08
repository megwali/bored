const { User } = require('../models');

const checkActionPermission = (user, req, res) => {
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  if (!req.decoded.admin && req.decoded.id !== user.id) {
    return res.status(403).send({ message: 'Forbidden' });
  }
}

module.exports = {
  list(req, res) {
    if (!req.decoded.admin) {
      return res.status(403).send({ message: 'Forbidden' });
    }

    return User.findAll({
      attributes: { exclude: ['password', 'issueId'] },
    })
      .then((users) => {
        if (!users) {
          return res.status(404).send({ message: 'No users found' });
        }

        return res.status(200).send(users);
      }, err => res.status(400).send(err));
  },
  retrieve(req, res) {
    return User.findById(req.params.userId, { attributes: ['email', 'id', 'name'] })
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: 'User not found' });
        }

        return res.status(200).send(user);
      }, err => res.status(400).send(err));
  },
  update(req, res) {
    return User.findById(req.params.userId).
      then((user) => {
        checkActionPermission(user, req, res);
        let fields = Object.keys(req.body);

        // Users cannot change their own admin status only other admins can
        if (req.decoded.id === user.id) {
          fields = fields.filter(f => (f !== admin && f !== issueId));
        }

        return user.update(req.body, { fields })
          .then(() => res.status(200).send({ id: user.id }), err => res.status(400).send(err));
      }, err => res.status(400).send(err));
  },
  destroy(req, res) {
    return User.findById(req.params.userId)
      .then((user) => {
        checkActionPermission(user, req, res);
        return user.destroy().then(() => res.status(204).send(), err => res.status(400).send(err));
      });
  },
};
