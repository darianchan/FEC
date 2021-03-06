import React from 'react';
import axios from 'axios';
import RatingBreakdown from './RatingBreakdown.jsx';
import ReviewTile from './ReviewTile.jsx';
import ProductBreakDown from './ProductBreakDown.jsx';
import ReviewForm from './ReviewForm.jsx';
import ReviewFilterSelector from './ReviewFilterSelector.jsx';

class RatingsReviews extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedReviews: false,
      loadedMeta: false,
      filters: [],
      showReviewModal: false,
      currentShownReviews: [],
      numberOfReviewsShowing: 2,
      filteredReviewList: [],
    };
    this.showReviewModal = this.showReviewModal.bind(this);
    this.closeReviewModal = this.closeReviewModal.bind(this);
    this.sortReviewsBy = this.sortReviewsBy.bind(this);
    this.sortByStars = this.sortByStars.bind(this);
    this.showMoreReviews = this.showMoreReviews.bind(this);
    this.removeFilters = this.removeFilters.bind(this);
  }

  componentDidMount() {
    // if (this.props.productData) {
    //   axios
    //     .get(`/api/reviews/meta?product_id=${this.props.productData.id}`)
    //     .then((data) => {
    //       // Calculate the total number of reviews.
    //       let totalNumberOfReviews;
    //       debugger;
    //       this.setState({ meta: data.data, loadedMeta: true });
    //       axios
    //         .get(`/api/reviews/?product_id=${this.props.productData.id}&sort=relevant&count=30`)
    //         .then((data) => {
    //           const reviews = [];
    //           for (let i = 0; i < this.state.numberOfReviewsShowing; i += 1) {
    //             reviews.push(data.data.results[i]);
    //           }
    //           this.setState({
    //             loadedReviews: true,
    //             product_id: this.props.productData.id,
    //             reviews: data.data.results,
    //             currentShownReviews: reviews,
    //           });
    //         })
    //         .catch((e) => {
    //           console.log(e);
    //         });
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
    // }
  }

  componentDidUpdate() {
    if (!this.props.productData) {
      return;
    }
    if (this.props.productData.id !== this.state.product_id) {
      // get the meta data first, then get the reivew data based on review count.
      axios
        .get(`/api/reviews/meta?product_id=${this.props.productData.id}`)
        .then((data) => {
          let totalReviews = 0;
          Object.keys(data.data.ratings).forEach((rating) => {
            totalReviews += parseInt(data.data.ratings[rating], 10);
          });
          axios
            .get(
              `/api/reviews/?product_id=${this.props.productData.id}&sort=relevant&count=${totalReviews}`
            )
            .then((data) => {
              const reviews = [];
              for (let i = 0; i < this.state.numberOfReviewsShowing; i += 1) {
                reviews.push(data.data.results[i]);
              }
              this.setState({
                loadedReviews: true,
                product_id: this.props.productData.id,
                reviews: data.data.results,
                currentShownReviews: reviews,
              });
            })
            .catch((e) => {
              console.log(e);
            });

          this.setState({ meta: data.data, loadedMeta: true });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  getReviews() {
    if (this.props.productData) {
      axios
        .get(`/api/reviews/?product_id=${this.props.productData.id}&sort=relevant&count=30`)
        .then((data) => {
          const reviews = [];
          for (let i = 0; i < this.state.numberOfReviewsShowing; i += 1) {
            reviews.push(data.data.results[i]);
          }
          this.setState({
            loadedReviews: true,
            product_id: this.props.productData.id,
            reviews: data.data.results,
            currentShownReviews: reviews,
          });
        })
        .catch((e) => {
          console.error(e);
        });
      axios
        .get(`/api/reviews/meta?product_id=${this.props.productData.id}`)
        .then((data) => {
          this.setState({ meta: data.data, loadedMeta: true });
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  generateReviewsArray(reviewsArray, reviewCount = null) {
    const { numberOfReviewsShowing } = this.state;
    const reviews = [];
    if (!reviewCount) {
      for (let i = 0; i < numberOfReviewsShowing; i += 1) {
        reviews.push(reviewsArray[i]);
      }
    } else {
      for (let i = 0; i < reviewCount; i += 1) {
        reviews.push(reviewsArray[i]);
      }
    }
    return reviews;
  }

  removeFilters() {
    let reviews = this.generateReviewsArray(this.state.reviews);
    this.setState({ filters: [], currentShownReviews: reviews });
  }

  sortByStars(filter) {
    const { reviews, filters } = this.state;
    // All of the reviews we have, are currently ordered by the selector.
    // Default there are no filtered reviews
    // If the user clicks on a filter, we need to generate a filtered review list to pull from.
    // Then ensure that we select from the filtered list instead of the current list when building
    // our tiles out.
    // Check if the filter is already in our filters, if it is remove it.
    let adjustedFilters = [];
    if (filters.includes(filter)) {
      filters.forEach((element) => {
        if (element !== filter) {
          adjustedFilters.push(element);
        }
      });
    } else {
      adjustedFilters = [...filters];
      adjustedFilters.push(filter);
    }
    // We added a filter, now we need to sort and set our state to filtered reviews.
    const filteredResults = [];
    reviews.forEach((review) => {
      if (adjustedFilters.includes(review.rating)) {
        filteredResults.push(review);
      }
    });
    // Add adjusted filters, and filtered reviews.
    let currentShownReviews = reviews;
    if (adjustedFilters.length !== 0) {
      currentShownReviews = this.generateReviewsArray(filteredResults);
    }
    if (adjustedFilters.length === 0) {
      currentShownReviews = this.generateReviewsArray(reviews);
    }
    this.setState({ currentShownReviews, filters: adjustedFilters });
  }

  sortReviewsBy(incomingChage) {
    axios
      .get(`/api/reviews/?product_id=${this.props.productData.id}&sort=${incomingChage}&count=400`)
      .then((data) => {
        const reviewsArray = this.generateReviewsArray(data.data.results);
        this.setState({ reviews: data.data.results, currentShownReviews: reviewsArray });
      })
      .catch((e) => {
        console.log(e);
      });
  }

  showMoreReviews() {
    const { numberOfReviewsShowing, filters, reviews } = this.state;
    const show = 2 + numberOfReviewsShowing;
    let newReviewsArray = [];
    if (filters.length === 0) {
      newReviewsArray = this.generateReviewsArray(reviews, show);
    } else {
      reviews.forEach((review) => {
        if (filters.includes(review.rating)) {
          newReviewsArray.push(review);
        }
      });
    }
    this.setState({ numberOfReviewsShowing: show, currentShownReviews: newReviewsArray });
  }

  showReviewModal() {
    this.setState({ showReviewModal: true });
  }

  closeReviewModal() {
    this.setState({ showReviewModal: false });
  }

  render() {
    const {
      loadedMeta,
      loadedReviews,
      showReviewModal,
      currentShownReviews,
      reviews,
      numberOfReviewsShowing,
    } = this.state;
    if (loadedReviews === false || loadedMeta === false || this.props.productData == null) {
      return <div />;
    }
    let ReviewButton = <div />;
    if (numberOfReviewsShowing <= reviews.length) {
      ReviewButton = (
        <button type="button" className="rr-button-pretty" onClick={this.showMoreReviews}>
          <span>More Reviews</span>
        </button>
      );
    }

    const { product_id, filters, meta } = this.state;
    return (
      <div className="rr-start-div">
        <h2>Ratings and Reviews.</h2>
        <ReviewFilterSelector
          ratings={this.state.meta.ratings}
          passChangeToRR={this.sortReviewsBy}
        />
        <div className="rr-parent" id="overview-link">
          {/* <div className="rr-rating-big" /> */}
          <div className="rr-tiles-container">
            {currentShownReviews.map((review, i) => (
              <ReviewTile item={product_id} key={i} review={review} />
            ))}
          </div>
          <div className="rr-rating-breakdown">
            <RatingBreakdown
              productId={product_id}
              changeFilter={this.sortByStars}
              removeFilters={this.removeFilters}
              filters={filters}
              meta={this.state.meta}
              updateStars={this.props.updateStars}
            />
          </div>
          {/* <div className="rr-product-breakdown-container"> */}
          <ProductBreakDown characteristics={this.state.meta.characteristics} />
          {/* </div> */}
        </div>
        <div>
          <ReviewForm
            productTitle={this.props.productData['name']}
            metaData={meta}
            showModal={showReviewModal}
            closeModal={this.closeReviewModal}
          />
          <div className="rr-review-footer">
            <button
              type="button"
              // id="o-add-to-bag-button"
              className="rr-button-pretty"
              onClick={this.showReviewModal}
            >
              <span>Add Review</span>
            </button>
            {ReviewButton}
          </div>
        </div>
      </div>
    );
  }
}

export default RatingsReviews;
