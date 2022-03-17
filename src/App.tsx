import { useEffect, useState } from 'react'

import './App.css'

type Item = {
  id: number
  title: string
  image: string
  price: number
}

type Order = {
  id: number
  userId: number
  itemId: number
  item: Item
  quantity: number
}

type User = {
  id: number
  name: string
  email: string
  orders: Order[]
}

function App () {
  const [user, setUser] = useState<null | User>(null)

  useEffect(() => {
    validateUser()
  }, [])

  function validateUser () {
    if (localStorage.token) {
      fetch('http://localhost:4000/validate', {
        headers: {
          Authorization: localStorage.token
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (data.error) {
            console.log('Validation failed.')
          } else {
            setUser(data)
          }
        })
    }
  }

  function signIn (email: string, password: string) {
    fetch('http://localhost:4000/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.error) {
          alert(data.error)
        } else {
          localStorage.token = data.token
          setUser(data.user) // data === { user, token }
        }
      })
  }

  function signOut () {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (user === null)
    return (
      <div className='App'>
        <form
          onSubmit={e => {
            e.preventDefault()
            // @ts-ignore
            const email = e.target.email.value
            // @ts-ignore
            const password = e.target.password.value
            signIn(email, password)
          }}
        >
          <input type='email' placeholder='email' name='email' />
          <input type='password' placeholder='password' name='password' />
          <button>SIGN IN</button>
        </form>
      </div>
    )

  let total = 0

  for (const order of user.orders) {
    total += order.quantity * order.item.price
  }

  function deleteOrder (id: number) {
    if (user === null) return

    // remove order from the server
    fetch(`http://localhost:4000/orders/${id}`, { method: 'DELETE' })
      .then(resp => resp.json())
      .then(data => {
        // check if an error came back
        if (data.error) return

        // now we know for sure that data is our updated user
        setUser(data)
      })
  }

  function updateQuantity (orderId: number, newQuantity: number) {
    // update order on server
    fetch(`http://localhost:4000/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        Authorization: localStorage.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newQuantity })
    })
      .then(resp => resp.json())
      // update state
      .then(updatedUser => setUser(updatedUser))
  }

  return (
    <div className='App'>
      <h1>
        Hello {user.name}! <button onClick={signOut}>SIGN OUT</button>
      </h1>
      <h2>Here are your orders:</h2>
      <ul className='order-list'>
        {user.orders.map(order => (
          <li className='order'>
            <div className='image-section'>
              <img src={order.item.image} alt='' />
            </div>
            <div className='info-section'>
              £{order.item.price}
              <select
                value={order.quantity}
                onChange={e => {
                  const newQuantity = Number(e.target.value)
                  if (newQuantity === 0) {
                    deleteOrder(order.id)
                  } else {
                    updateQuantity(order.id, newQuantity)
                  }
                }}
              >
                <option>0</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
              </select>
            </div>
          </li>
        ))}
      </ul>
      <h3>Total: £{total.toFixed(2)}</h3>
    </div>
  )
}

export default App
